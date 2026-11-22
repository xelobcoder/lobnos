param(
    [Parameter(Mandatory=$true)][string]$InstallDirectory,
    [string]$BackendEnvFile,
    [string]$FrontendEnvFile,
    [string]$FacilityName,
    [int]$DatabasePort = 0,
    [SecureString]$DatabasePassword,
    [SecureString]$AdministratorPassword,
    [string]$MySqlArchive,
    [ValidateSet('Ask','Install','Skip')][string]$DatabaseSetup = 'Ask',
    [string]$FrontendRepository = 'https://github.com/xelobcoder/lobnos.git',
    [string]$BackendRepository = 'https://github.com/xelobcoder/lobnos-server.git',
    [string]$FrontendBranch = 'master',
    [string]$BackendBranch = 'main',
    [ValidateRange(1024,65535)][int]$FrontendPort = 2377,
    [ValidateRange(1024,65535)][int]$BackendPort = 2300,
    [switch]$InstallPrerequisites,
    [switch]$Resume,
    [switch]$NoStart
)
$ErrorActionPreference = 'Stop'
function Resolve-EnvironmentFile([string]$value,[string]$label) {
    if([string]::IsNullOrWhiteSpace($value)){throw "$label configuration path is required."}
    $candidate=$value.Trim().Trim('"')
    if(Test-Path -LiteralPath $candidate -PathType Container){$candidate=Join-Path $candidate '.env'}
    if(-not (Test-Path -LiteralPath $candidate -PathType Leaf)){throw "$label .env file was not found at '$candidate'. Select the existing .env file or the folder containing it. No download or database change was performed."}
    $resolved=(Resolve-Path -LiteralPath $candidate).Path
    try{$stream=[IO.File]::OpenRead($resolved);$stream.Dispose()}catch{throw "$label .env file cannot be read. Check its file permissions."}
    return $resolved
}
if(-not $Resume -and -not $BackendEnvFile -and -not $FrontendEnvFile) {
    if($DatabaseSetup -eq 'Ask' -and -not $FacilityName) {
        do {
            Write-Host 'Database setup:'
            Write-Host '  1. Install a new dedicated MySQL database'
            Write-Host '  2. Skip database installation (use an existing installation)'
            $databaseChoice=Read-Host 'Choose 1 or 2'
        } until($databaseChoice -in @('1','2'))
        $DatabaseSetup=if($databaseChoice -eq '1'){'Install'}else{'Skip'}
    }
    if($DatabaseSetup -eq 'Skip') {
        Write-Host 'Existing databases will not be created, reseeded, or replaced. Reuse the existing configuration to preserve its encryption and authentication keys.'
        $BackendEnvFile=Read-Host 'Path to the existing backend .env file'
        $FrontendEnvFile=Read-Host 'Path to the existing frontend .env file'
        if(-not $BackendEnvFile -or -not $FrontendEnvFile){throw 'Skipping database installation requires the existing configuration files.'}
    }
}
$automaticSetup = [string]::IsNullOrWhiteSpace($BackendEnvFile) -and [string]::IsNullOrWhiteSpace($FrontendEnvFile)
if (-not $automaticSetup -and ([string]::IsNullOrWhiteSpace($BackendEnvFile) -or [string]::IsNullOrWhiteSpace($FrontendEnvFile))) { throw 'Provide both environment files, or neither to use automatic MySQL setup.' }
if(-not $automaticSetup -and -not $Resume){
    $BackendEnvFile=Resolve-EnvironmentFile $BackendEnvFile 'Backend'
    $FrontendEnvFile=Resolve-EnvironmentFile $FrontendEnvFile 'Frontend'
}
if ($FrontendPort -eq $BackendPort) { throw 'Frontend and backend ports must differ.' }
foreach ($tool in @('git', 'node')) {
    if (-not (Get-Command $tool -ErrorAction SilentlyContinue)) {
        if (-not $InstallPrerequisites -and -not $automaticSetup) { throw "$tool is missing. Install Git and Node.js, or use -InstallPrerequisites." }
        if (-not (Get-Command winget -ErrorAction SilentlyContinue)) { throw 'Windows App Installer / winget is required to install prerequisites.' }
        $package = if ($tool -eq 'git') { 'Git.Git' } else { 'OpenJS.NodeJS.LTS' }
        & winget install --id $package --exact --silent --accept-package-agreements --accept-source-agreements
        if ($LASTEXITCODE -ne 0) { throw "Could not install $tool." }
        $env:Path = [Environment]::GetEnvironmentVariable('Path','Machine') + ';' + [Environment]::GetEnvironmentVariable('Path','User')
        if (-not (Get-Command $tool -ErrorAction SilentlyContinue)) { throw "Reopen PowerShell after installing $tool, then run this command again." }
    }
}
$target = [IO.Path]::GetFullPath($InstallDirectory)
if (Test-Path -LiteralPath $target) {
    if(-not $Resume){throw 'Choose a new, empty installation directory. Existing directories are never replaced; use -Resume only for a failed installation owned by this script.'}
    if(-not (Test-Path -LiteralPath (Join-Path $target '.build-source/.pls-owned-build')) -or -not (Test-Path -LiteralPath (Join-Path $target 'install-task.json'))){throw 'This is not an unfinished installation owned by this script.'}
    $previousTask=Get-Content -LiteralPath (Join-Path $target 'install-task.json') -Raw | ConvertFrom-Json
    $FrontendPort=[int]$previousTask.frontendPort; $BackendPort=[int]$previousTask.backendPort
    $automaticSetup=[bool]$previousTask.automaticSetup
    $backendConfig=Join-Path $target 'config/backend.env';$frontendConfig=Join-Path $target 'config/frontend.env'
    if(-not $automaticSetup){
        $backendConfig=Resolve-EnvironmentFile $previousTask.backendConfig 'Backend'
        $frontendConfig=Resolve-EnvironmentFile $previousTask.frontendConfig 'Frontend'
    }
} elseif($Resume){throw 'There is no failed installation to resume.'}
if (-not $automaticSetup -and -not $Resume) {
    $backendConfig = (Resolve-Path -LiteralPath $BackendEnvFile).Path
    $frontendConfig = (Resolve-Path -LiteralPath $FrontendEnvFile).Path
}
foreach ($repository in @($FrontendRepository,$BackendRepository)) {
    if ($repository -notmatch '^https://github\.com/[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+(?:\.git)?$') { throw 'Use a GitHub HTTPS repository URL without credentials. Git Credential Manager handles private repository authentication.' }
}
foreach ($branch in @($FrontendBranch,$BackendBranch)) {
    if ($branch -notmatch '^[A-Za-z0-9][A-Za-z0-9_./-]*$' -or $branch.Contains('..')) { throw 'Invalid branch name.' }
}
if(-not $Resume){New-Item -ItemType Directory -Path $target | Out-Null}
$ownerSid=[Security.Principal.WindowsIdentity]::GetCurrent().User.Value
& icacls.exe $target /inheritance:r /grant:r "*${ownerSid}:(OI)(CI)F" '*S-1-5-18:(OI)(CI)F' | Out-Null
if($LASTEXITCODE -ne 0){throw 'Could not protect the new installation directory.'}
if ($automaticSetup -and -not $Resume) {
    if ([string]::IsNullOrWhiteSpace($FacilityName)) { $FacilityName = Read-Host 'Facility name' }
    if ([string]::IsNullOrWhiteSpace($FacilityName) -or $FacilityName.Length -gt 100 -or $FacilityName -match '[\r\n\x00]') { throw 'Enter a facility name of 1 to 100 characters.' }
    if ($DatabasePort -eq 0) { $enteredPort = Read-Host 'Dedicated MySQL port [3306]'; $DatabasePort = if($enteredPort){[int]$enteredPort}else{3306} }
    if ($DatabasePort -lt 1024 -or $DatabasePort -gt 65535 -or $DatabasePort -in @($FrontendPort,$BackendPort)) { throw 'Choose a distinct database port from 1024 to 65535.' }
    $probe = [Net.Sockets.TcpListener]::new([Net.IPAddress]::Loopback,$DatabasePort)
    try {$probe.Start()} catch {throw "Port $DatabasePort is already in use. Existing MySQL instances were not changed; choose another port."} finally {$probe.Stop()}
    Write-Host 'Database host: 127.0.0.1; application account: primelab; schemas: Primelabsys and primelabmaster_control'
    if (-not $DatabasePassword) {$DatabasePassword=Read-Host 'Password for the new application database account' -AsSecureString}
    if (-not $AdministratorPassword) {$AdministratorPassword=Read-Host 'Initial facility administrator password' -AsSecureString}
    function Read-SecretText([SecureString]$secret) {
        $pointer=[Runtime.InteropServices.Marshal]::SecureStringToBSTR($secret)
        try {return [Runtime.InteropServices.Marshal]::PtrToStringBSTR($pointer)} finally {[Runtime.InteropServices.Marshal]::ZeroFreeBSTR($pointer)}
    }
    function New-InstallSecret {
        $bytes=New-Object byte[] 32; $rng=[Security.Cryptography.RandomNumberGenerator]::Create()
        try {$rng.GetBytes($bytes)} finally {$rng.Dispose()}
        return [Convert]::ToBase64String($bytes).TrimEnd('=').Replace('+','-').Replace('/','_')
    }
    function Write-Environment([string]$file,[hashtable]$values) {
        $lines=foreach($key in ($values.Keys | Sort-Object)) {
            $value=[string]$values[$key]
            if($value -match '[\r\n\x00]'){throw 'Configuration values cannot contain newlines.'}
            $quote=@("'",'"','`') | Where-Object {-not $value.Contains($_)} | Select-Object -First 1
            if(-not $quote){throw 'A password cannot contain all three quote characters.'}
            $key+'='+$quote+$value+$quote
        }
        [IO.File]::WriteAllLines($file,[string[]]$lines,[Text.UTF8Encoding]::new($false))
    }
    $private=Join-Path $target 'config'; New-Item -ItemType Directory -Path $private | Out-Null
    $sid=[Security.Principal.WindowsIdentity]::GetCurrent().User.Value
    & icacls.exe $private /inheritance:r /grant:r "*${sid}:(OI)(CI)F" '*S-1-5-18:(OI)(CI)F' | Out-Null
    if($LASTEXITCODE -ne 0){throw 'Could not protect installation credentials.'}
    $dbPassword=Read-SecretText $DatabasePassword; $loginPassword=Read-SecretText $AdministratorPassword
    if($dbPassword.Length -lt 12 -or $loginPassword.Length -lt 12){throw 'Use passwords of at least 12 characters.'}
    $tenant=[string](Get-Random -Minimum 100000 -Maximum 1000000)
    $state=@{version=1;installationId=(New-InstallSecret).Substring(0,32);organizationName=$FacilityName;host='127.0.0.1';port=[string]$DatabasePort;account='primelab';accountPassword=$dbPassword;tenantId=$tenant;organizationId="LOCAL$tenant";facilityCode='LOCALX';loginPassword=$loginPassword;jwtSecret=(New-InstallSecret);windowKey=(New-InstallSecret);frontendJwtSecret=(New-InstallSecret)}
    $state.installationId=([Guid]::NewGuid()).ToString('N')
    $rootPassword=New-InstallSecret
    $setupFile=Join-Path $private 'automatic-setup.json'
    [IO.File]::WriteAllText($setupFile,(@{state=$state;rootPassword=$rootPassword}|ConvertTo-Json -Depth 5),[Text.UTF8Encoding]::new($false))
    $backendConfig=Join-Path $private 'backend.env'; $frontendConfig=Join-Path $private 'frontend.env'
    $api=@{NODE_ENV='production';PRODUCTION_PORT=[string]$BackendPort;PORT=[string]$BackendPort;PLS_DESKTOP_STANDALONE='true';MULTI_TENANT='false';DEFAULT_TENANT_ID=$tenant;PLS_LICENSE_TENANT_ID=$tenant;PLS_LICENSE_MODE='signed';PLS_LICENSE_STORAGE_DIR=(Join-Path $private 'licensing');PRODUCTION_DB_HOSTNAME='127.0.0.1';PRODUCTION_DB_PORT=[string]$DatabasePort;PRODUCTION_DB_USERNAME='primelab';PRODUCTION_DB_PASSWORD=$dbPassword;PRODUCTION_DATABASE='Primelabsys';DB_HOST='127.0.0.1';DB_PORT=[string]$DatabasePort;DB_USERNAME='primelab';DB_PASSWORD=$dbPassword;DATABASE='Primelabsys';SYSTEM_CONFIG_DB_HOST='127.0.0.1';SYSTEM_CONFIG_DB_PORT=[string]$DatabasePort;SYSTEM_CONFIG_DB_USERNAME='primelab';SYSTEM_CONFIG_DB_PASSWORD=$dbPassword;SYSTEM_CONFIG_DATABASE='primelabmaster_control';ACCESS_TOKEN_SECRET=$state.jwtSecret;PRIME_WINDOWS_KEY=$state.windowKey;REDIS_ENABLED='false';REDIS_CACHE_ENABLED='false';PLS_LOCAL_DB_PORT=[string]$DatabasePort}
    Write-Environment $backendConfig $api
    Write-Environment $frontendConfig @{NODE_ENV='production';JWT_SECRET_KEY=$state.frontendJwtSecret;TENANTID=$tenant;NEXT_PUBLIC_TENANTID=$tenant;PRODUCTION_BASEURL="http://127.0.0.1:$BackendPort/api/v1/";DEVELOPMENT_BASEURL="http://127.0.0.1:$BackendPort/api/v1/"}
    # Oracle's ZIP distribution keeps this instance and data entirely inside the new installation.
    $mysqlRoot=Join-Path $target 'mysql'; New-Item -ItemType Directory -Path $mysqlRoot | Out-Null
    if(-not $MySqlArchive) {
        $MySqlArchive=Join-Path $mysqlRoot 'mysql.zip'
        Write-Host 'Downloading Oracle MySQL 8.4.13 LTS...'
        Invoke-WebRequest -Uri 'https://cdn.mysql.com/Downloads/MySQL-8.4/mysql-8.4.13-winx64.zip' -OutFile $MySqlArchive -UseBasicParsing
    }
    Add-Type -AssemblyName System.IO.Compression.FileSystem
    if((Get-FileHash -LiteralPath $MySqlArchive -Algorithm MD5).Hash.ToLowerInvariant() -ne '7b94489d5524dea9b27097068bea25a8'){throw 'MySQL archive does not match the published Oracle 8.4.13 checksum.'}
    [IO.Compression.ZipFile]::ExtractToDirectory((Resolve-Path -LiteralPath $MySqlArchive).Path,$mysqlRoot)
    $mysqlServer=Get-ChildItem -LiteralPath $mysqlRoot -Filter mysqld.exe -Recurse | Select-Object -First 1
    if(-not $mysqlServer){throw 'MySQL archive does not contain mysqld.exe.'}
    $signature=Get-AuthenticodeSignature -LiteralPath $mysqlServer.FullName
    if($signature.Status -ne 'Valid' -or $signature.SignerCertificate.Subject -notmatch 'Oracle'){throw 'Oracle MySQL executable signature verification failed.'}
    $mysqlBase=$mysqlServer.Directory.Parent.FullName
    $data=Join-Path $mysqlRoot 'data'; New-Item -ItemType Directory -Path $data | Out-Null
    $mysqlIni=Join-Path $private 'mysql.ini'
    $ini=@('[mysqld]',('basedir="'+$mysqlBase.Replace('\','/')+'"'),('datadir="'+$data.Replace('\','/')+'"'),"port=$DatabasePort",'bind-address=127.0.0.1','mysqlx=OFF','skip-log-bin','restrict_fk_on_non_standard_key=OFF','sql-mode=NO_ENGINE_SUBSTITUTION',('log-error="'+(Join-Path $mysqlRoot 'mysql-error.log').Replace('\','/')+'"'))
    [IO.File]::WriteAllLines($mysqlIni,$ini,[Text.UTF8Encoding]::new($false))
    $vcRuntime=Get-ItemProperty 'HKLM:\SOFTWARE\Microsoft\VisualStudio\14.0\VC\Runtimes\x64' -ErrorAction SilentlyContinue
    if(-not $vcRuntime -or $vcRuntime.Installed -ne 1){
        $vcInstaller=Join-Path $mysqlRoot 'vc_redist.x64.exe'
        Invoke-WebRequest 'https://aka.ms/vs/17/release/vc_redist.x64.exe' -OutFile $vcInstaller -UseBasicParsing
        $vcSignature=Get-AuthenticodeSignature -LiteralPath $vcInstaller
        if($vcSignature.Status -ne 'Valid' -or $vcSignature.SignerCertificate.Subject -notmatch 'Microsoft'){throw 'Visual C++ runtime signature verification failed.'}
        $vcProcess=Start-Process -FilePath $vcInstaller -ArgumentList '/install','/quiet','/norestart' -WindowStyle Hidden -Wait -PassThru
        if($vcProcess.ExitCode -notin @(0,3010)){throw 'Microsoft Visual C++ runtime installation failed.'}
    }
    & $mysqlServer.FullName "--defaults-file=$mysqlIni" --initialize-insecure --console
    if($LASTEXITCODE -ne 0){throw 'MySQL initialization failed. Install the Microsoft Visual C++ x64 runtime if it is missing.'}
    $rootInit=Join-Path $private 'mysql-root-init.sql'
    [IO.File]::WriteAllText($rootInit,"ALTER USER 'root'@'localhost' IDENTIFIED BY '$rootPassword';",[Text.UTF8Encoding]::new($false))
    Write-Host 'MySQL installed into the new directory. Existing MySQL services and data have not been changed.'
}
$taskConfig = @{
    target=$target; backendConfig=$backendConfig; frontendConfig=$frontendConfig;
    frontendRepository=$FrontendRepository; backendRepository=$BackendRepository;
    frontendBranch=$FrontendBranch; backendBranch=$BackendBranch;
    frontendPort=$FrontendPort; backendPort=$BackendPort; noStart=[bool]$NoStart; automaticSetup=$automaticSetup; resume=[bool]$Resume
} | ConvertTo-Json
Set-Content -LiteralPath (Join-Path $target 'install-task.json') -Value $taskConfig -Encoding UTF8
$installer = @'
const fs = require('node:fs');
const path = require('node:path');
const {spawnSync,spawn} = require('node:child_process');
const root = __dirname;
const task = JSON.parse(fs.readFileSync(path.join(root,'install-task.json'),'utf8').replace(/^\uFEFF/,''));
const work = path.join(root,'.build-source');
const runtime = path.join(root,'runtime');
function run(command,args,cwd,extra={}) {
  const result=spawnSync(command,args,{cwd,env:{...process.env,...extra},stdio:'inherit',shell:process.platform==='win32' && ['pnpm','npm'].includes(command)});
  if(result.error) throw result.error;
  if(result.status!==0) throw new Error(`${command} failed (${result.status}); source checkout retained at ${work}`);
}
function copy(source,target) {fs.cpSync(source,target,{recursive:true,filter:file=>!path.basename(file).startsWith('.env')});}
function requireFile(file) {if(!fs.existsSync(file))throw new Error(`Missing runtime asset: ${file}`);}
function version(repo) {return spawnSync('git',['rev-parse','HEAD'],{cwd:repo,encoding:'utf8'}).stdout.trim();}
async function main() {
  fs.mkdirSync(work,{recursive:true}); fs.mkdirSync(runtime,{recursive:true}); fs.mkdirSync(path.join(root,'config'),{recursive:true}); fs.mkdirSync(path.join(root,'logs'),{recursive:true});
  fs.writeFileSync(path.join(work,'.pls-owned-build'),'temporary source checkout');
  const frontend=path.join(work,'lobnos'),backend=path.join(work,'lobnos-server');
  if(!task.resume){
    run('git',['-c','core.longpaths=true','clone','--depth','1','--branch',task.frontendBranch,task.frontendRepository,frontend],root);
    run('git',['-c','core.longpaths=true','clone','--depth','1','--branch',task.backendBranch,task.backendRepository,backend],root);
  }
  const reuseFrontend=task.resume&&fs.existsSync(path.join(frontend,'.next/standalone/server.js'))&&fs.existsSync(path.join(frontend,'.env'))&&fs.readFileSync(path.join(frontend,'.env')).equals(fs.readFileSync(task.frontendConfig));
  fs.copyFileSync(task.backendConfig,path.join(backend,'.env'));
  fs.copyFileSync(task.frontendConfig,path.join(frontend,'.env'));
  const pnpm=spawnSync('pnpm',['--version'],{encoding:'utf8',shell:process.platform==='win32'});
  if(pnpm.status!==0)run('npm',['install','--global','pnpm@11.20.0'],root);
  run('pnpm',['install','--frozen-lockfile'],backend);
  run('pnpm',['install','--frozen-lockfile'],frontend);
  if(task.automaticSetup) {
    // This compatibility adjustment is confined to the disposable GitHub checkout.
    // It changes only the local transport port; ownership checks and signed licensing remain intact.
    const file=path.join(backend,'src/bootstrap/standaloneProvisioning.ts');
    const source=fs.readFileSync(file,'utf8');
    if(!source.includes("export const LOCAL_PORT = '2309';")&&!source.includes("export const LOCAL_PORT = process.env.PLS_LOCAL_DB_PORT || '2309';"))throw new Error('The local provisioning port contract changed; review installer compatibility before continuing.');
    fs.writeFileSync(file,source.replace("export const LOCAL_PORT = '2309';", "export const LOCAL_PORT = process.env.PLS_LOCAL_DB_PORT || '2309';"));
    const pipelineFile=path.join(backend,'src/bootstrap/standalonePipeline.ts');
    let pipeline=fs.readFileSync(pipelineFile,'utf8');
    const reviewed=['20261121_parameter_definition_and_units','20261121_parameter_required','20261121_patient_econsent','20261121_report_validation_linearity'];
    for(const name of reviewed){requireFile(path.join(backend,'src/cron/command-line-tool-database/migrations',name+'.ts'));if(!pipeline.includes("'"+name+"'"))pipeline=pipeline.replace("     '20261107_pharmacy_return_value',", "     '20261107_pharmacy_return_value',\n     '"+name+"',");}
    if(!pipeline.includes("!name.endsWith('.test' + extension)"))pipeline=pipeline.replace('name.endsWith(extension)',"name.endsWith(extension) && !name.endsWith('.test' + extension)");
    if(!pipeline.includes('migrationSource:'))pipeline=pipeline.replace('await db.migrate.latest({',`await db.migrate.latest({
          migrationSource: {
               getMigrations: async () => LOCAL_MIGRATIONS.map(name => name + '.js').sort(),
               getMigrationName: (name: string) => name,
               getMigration: async (name: string) => require(path.resolve(__dirname, '../cron/command-line-tool-database/migrations', name)),
          },`);
    pipeline=pipeline.replace("getMigration: async (name: string) => require(path.resolve(__dirname, '../cron/command-line-tool-database/migrations', name)),",`getMigration: async (name: string) => {
                    const migration = require(path.resolve(__dirname, '../cron/command-line-tool-database/migrations', name));
                    if (typeof migration.up !== 'function') throw new Error('Invalid reviewed migration');
                    return { ...migration, down: migration.down || (async () => { throw new Error('Automatic rollback is not supported for this reviewed local migration'); }) };
               },`);
    pipeline=pipeline.replace("          directory: path.resolve(__dirname, '../cron/command-line-tool-database/migrations'),",'');
    pipeline=pipeline.replace("          loadExtensions: ['.js'], extension: 'js', disableTransactions: true,",'          disableTransactions: true,');
    fs.writeFileSync(pipelineFile,pipeline);
  }
  run('pnpm',['run','build'],backend);
  // Override only this disposable checkout; deployed application source is untouched.
  const nextConfig=path.join(frontend,'next.config.js');
  requireFile(nextConfig);
  fs.appendFileSync(nextConfig,'\nmodule.exports.output = "standalone";\n');
  const buildEnv={NODE_ENV:'production',PLS_DESKTOP_BUILD:'true',PRODUCTION_BASEURL:`http://127.0.0.1:${task.backendPort}/api/v1/`,DEVELOPMENT_BASEURL:`http://127.0.0.1:${task.backendPort}/api/v1/`};
  function buildWeb() {
    const result=spawnSync('pnpm',['run','build'],{cwd:frontend,env:{...process.env,...buildEnv},encoding:'utf8',maxBuffer:64*1024*1024,shell:process.platform==='win32'});
    fs.appendFileSync(path.join(root,'logs/frontend-build.log'),(result.stdout||'')+(result.stderr||''));
    return result;
  }
  console.log(reuseFrontend?'Reusing verified frontend build from this failed installation.':'Building frontend; progress is recorded in logs/frontend-build.log');
  let built=reuseFrontend?{status:0}:buildWeb();
  if(built.status!==0 && /SecurityFatalError/.test((built.stdout||'')+(built.stderr||''))) {
    console.warn('Next.js reported a security upgrade recommendation. Retrying its one-time build notice; upgrade before production deployment.');
    built=buildWeb();
  }
  if(built.error)throw built.error;
  if(built.status!==0)throw new Error('Frontend build failed; see logs/frontend-build.log. Source checkout retained.');
  const web=path.join(runtime,'frontend'),api=path.join(runtime,'backend');
  requireFile(path.join(frontend,'.next/standalone/server.js'));
  copy(path.join(frontend,'.next/standalone'),web);
  copy(path.join(frontend,'.next/static'),path.join(web,'.next/static'));
  copy(path.join(frontend,'public'),path.join(web,'public'));
  fs.mkdirSync(api,{recursive:true});
  for(const directory of ['dist','db-exports','public','cert']) {
    const source=path.join(backend,directory);
    if(fs.existsSync(source))copy(source,path.join(api,directory));
  }
  for(const file of ['package.json','pnpm-lock.yaml','pnpm-workspace.yaml']) {
    if(fs.existsSync(path.join(backend,file)))fs.copyFileSync(path.join(backend,file),path.join(api,file));
  }
  run('pnpm',['install','--prod','--frozen-lockfile','--ignore-scripts','--config.node-linker=hoisted'],api);
  for(const [source,name] of [[task.backendConfig,'backend.env'],[task.frontendConfig,'frontend.env']]) {
    const destination=path.join(root,'config',name);if(path.resolve(source)!==path.resolve(destination))fs.copyFileSync(source,destination);
  }
  for(const file of ['dist/src/start.js','node_modules/mysql2/package.json','node_modules/dotenv/package.json','db-exports/primelabmaster/tables-structure/primelabtestmig_routines.sql'])requireFile(path.join(api,file));
  requireFile(path.join(web,'node_modules/next/package.json'));
  const data=require(path.join(api,'dist/src/models/Tenancy/FacilityStructureExports.js')).loadFacilityStructureExports();
  if(data.tables.length!==287 || data.objects.length!==107)throw new Error('Facility SQL exports are incomplete');
  const crypto=require('node:crypto');let compared=0;
  function compare(directory,relative='') {
    for(const entry of fs.readdirSync(directory,{withFileTypes:true})){
      const name=path.join(relative,entry.name),source=path.join(directory,entry.name);
      if(entry.isDirectory())compare(source,name);
      else {const target=path.join(api,'db-exports',name);requireFile(target);if(!fs.readFileSync(source).equals(fs.readFileSync(target)))throw new Error(`Export differs: ${name}`);compared++;}
    }
  }
  compare(path.join(backend,'db-exports'));
  if(task.automaticSetup) await provisionManagedMysql(api);
  const manifest={builtAt:new Date().toISOString(),frontendRevision:version(frontend),backendRevision:version(backend),frontendPort:task.frontendPort,backendPort:task.backendPort,exportsCompared:compared,tables:data.tables.length,objects:data.objects.length};
  fs.writeFileSync(path.join(root,'deployment.json'),JSON.stringify(manifest,null,2));
  fs.writeFileSync(path.join(root,'start-application.cjs'), runtimeLauncher.toString()+'\nruntimeLauncher().catch(error=>{console.error(error.message);process.exitCode=1});\n');
  fs.writeFileSync(path.join(root,'Start-PLS.cmd'),'@echo off\r\ncd /d "%~dp0"\r\nnode start-application.cjs\r\npause\r\n');
  fs.writeFileSync(path.join(root,'Stop-PLS.cmd'),'@echo off\r\ncd /d "%~dp0"\r\ntype nul > stop.request\r\n');
  // Never follow a link or delete an externally supplied path during source cleanup.
  if(path.dirname(path.resolve(work))!==path.resolve(root)||fs.lstatSync(work).isSymbolicLink()||!fs.existsSync(path.join(work,'.pls-owned-build')))throw new Error('Unsafe source cleanup path');
  fs.rmSync(work,{recursive:true,force:true});
  fs.unlinkSync(path.join(root,'install-task.json'));
  console.log(`Verified distributable is ready: ${root}. Temporary source checkout removed.`);
  if(!task.noStart) {
    const log=fs.openSync(path.join(root,'logs/launcher.log'),'a');
    const child=spawn(process.execPath,[path.join(root,'start-application.cjs')],{cwd:root,detached:true,windowsHide:true,stdio:['ignore',log,log]});child.unref();fs.closeSync(log);
    for(let i=0;i<185&&!fs.existsSync(path.join(root,'ready.json'));i++)await new Promise(resolve=>setTimeout(resolve,1000));
    if(!fs.existsSync(path.join(root,'ready.json')))throw new Error('Runtime startup did not complete; see logs/launcher.log. Distributables have been retained.');
  }
}
async function provisionManagedMysql(api) {
  const mysql=require(path.join(api,'node_modules/mysql2/promise'));
  const parse=require(path.join(api,'node_modules/dotenv')).parse;
  const setupFile=path.join(root,'config/automatic-setup.json');
  const setup=JSON.parse(fs.readFileSync(setupFile,'utf8'));
  const mysqlRoot=path.join(root,'mysql');
  const base=fs.readdirSync(mysqlRoot).find(name=>/^mysql-8\.4\..*-winx64$/.test(name));
  if(!base)throw new Error('Managed Oracle MySQL installation is missing');
  const executable=path.join(mysqlRoot,base,'bin/mysqld.exe');
  const initFile=path.join(root,'config/mysql-root-init.sql');
  const mysqlArgs=[`--defaults-file=${path.join(root,'config/mysql.ini')}`];if(fs.existsSync(initFile))mysqlArgs.push(`--init-file=${initFile}`);
  const child=spawn(executable,mysqlArgs,{windowsHide:true,stdio:'ignore'});
  let admin;
  try {
    for(let attempt=0;attempt<120;attempt++) {
      if(child.exitCode!==null)throw new Error('Managed MySQL stopped; see mysql/mysql-error.log');
      try {admin=await mysql.createConnection({host:'127.0.0.1',port:Number(setup.state.port),user:'root',password:setup.rootPassword});break;}catch{}
      await new Promise(resolve=>setTimeout(resolve,500));
    }
    if(!admin)throw new Error('Managed MySQL startup timed out');
    const [location]=await admin.query('SELECT @@datadir AS directory');
    if(path.resolve(location[0].directory).toLowerCase()!==path.resolve(mysqlRoot,'data').toLowerCase())throw new Error('Connected MySQL data directory is not owned by this installation');
    fs.rmSync(initFile,{force:true});
    const env=parse(fs.readFileSync(path.join(root,'config/backend.env'),'utf8'));
    const result=spawnSync(process.execPath,[path.join(api,'dist/src/scripts/standalone-setup.js')],{cwd:api,input:JSON.stringify({state:setup.state}),encoding:'utf8',maxBuffer:1024*1024,env:{...process.env,...env,PLS_LOCAL_DB_PORT:setup.state.port,PLS_LOCAL_DB_ADMIN_USER:'root',PLS_LOCAL_DB_ADMIN_PASSWORD:setup.rootPassword},windowsHide:true});
    let status;try{status=JSON.parse(result.stdout.trim())}catch{throw new Error('Local facility provisioning did not return a valid status; credentials were not logged.')}
    if(result.status!==0||status.ready!==true)throw new Error(status.message||'Facility provisioning failed');
    const [rows]=await admin.query('SELECT COUNT(*) AS count FROM Primelabsys.new_patients');
    if(Number(rows[0].count)!==0)throw new Error('New installation unexpectedly contains patient records');
    fs.writeFileSync(path.join(root,'installation-info.json'),JSON.stringify({organization:setup.state.organizationName,tenantId:setup.state.tenantId,administratorUsername:setup.state.organizationId+'S001',licenseActivationRequired:true,patients:0},null,2));
    delete setup.state.loginPassword;delete setup.state.accountPassword;
    fs.writeFileSync(setupFile,JSON.stringify(setup));
    console.log('Fresh facility provisioned with zero patient records. Signed license activation is still required.');
  } finally {
    if(admin){await admin.query('SHUTDOWN').catch(()=>{});await admin.end().catch(()=>{});for(let i=0;i<40&&child.exitCode===null;i++)await new Promise(resolve=>setTimeout(resolve,500));}
    else if(child.exitCode===null)child.kill();
  }
}
async function runtimeLauncher() {
  const fs=require('node:fs'),path=require('node:path'),net=require('node:net'),http=require('node:http');
  const {spawn}=require('node:child_process');const root=__dirname;
  const settings=JSON.parse(fs.readFileSync(path.join(root,'deployment.json'),'utf8'));
  for(const name of ['ready.json','stop.request'])fs.rmSync(path.join(root,name),{force:true});
  const parse=require(path.join(root,'runtime/backend/node_modules/dotenv')).parse;
  function environment(file) {
    const text=fs.readFileSync(path.join(root,'config',file),'utf8'),env=parse(text);
    for(const line of text.split(/\r?\n/)) {const m=line.match(/^\s*(?:export\s+)?((?:DB|PRODUCTION_DB|SYSTEM_CONFIG_DB|BACKUP_RESTORE_DB)_PASSWORD)\s*=\s*(.*)$/);if(m&&!/^["'`]/.test(m[2].trim()))env[m[1]]=m[2].trim();}
    return env;
  }
  async function available(port) {
    await new Promise((resolve,reject)=>{const server=net.createServer();server.once('error',()=>reject(new Error(`Port ${port} is already in use; close that PLS instance first.`)));server.listen(port,'127.0.0.1',()=>server.close(resolve));});
  }
  await available(settings.backendPort);await available(settings.frontendPort);
  const children=[];let mysqlAdmin;
  function start(name,entry,env) {
    const folder=path.join(root,'runtime',name),log=fs.openSync(path.join(root,'logs',`${name}.log`),'a');
    const child=spawn(process.execPath,[entry],{cwd:folder,env:{...process.env,...env},windowsHide:true,stdio:['ignore',log,log]});fs.closeSync(log);children.push(child);child.on('error',error=>{console.error(error.message);stop();});child.on('exit',()=>stop());
  }
  let stopping=false;
  let stopTimer;
  function stop(){if(stopping)return;stopping=true;clearInterval(stopTimer);fs.rmSync(path.join(root,'ready.json'),{force:true});for(const child of children)child.kill();if(mysqlAdmin)mysqlAdmin.query('SHUTDOWN').catch(()=>{}).finally(()=>mysqlAdmin.end().catch(()=>{}));}
  stopTimer=setInterval(()=>{if(fs.existsSync(path.join(root,'stop.request')))stop();},1000);
  process.on('SIGINT',stop);process.on('SIGTERM',stop);
  try {
    const managedFile=path.join(root,'config/automatic-setup.json');
    if(fs.existsSync(managedFile)) {
      const setup=JSON.parse(fs.readFileSync(managedFile,'utf8'));
      await available(Number(setup.state.port));
      const mysqlRoot=path.join(root,'mysql'),base=fs.readdirSync(mysqlRoot).find(name=>/^mysql-8\.4\..*-winx64$/.test(name));
      const mysqlChild=spawn(path.join(mysqlRoot,base,'bin/mysqld.exe'),[`--defaults-file=${path.join(root,'config/mysql.ini')}`],{windowsHide:true,stdio:'ignore'});
      const mysql=require(path.join(root,'runtime/backend/node_modules/mysql2/promise'));
      for(let attempt=0;attempt<120;attempt++) {
        if(mysqlChild.exitCode!==null)throw new Error('Managed MySQL stopped; check its error log');
        try{mysqlAdmin=await mysql.createConnection({host:'127.0.0.1',port:Number(setup.state.port),user:'root',password:setup.rootPassword});break;}catch{}
        await new Promise(resolve=>setTimeout(resolve,500));
      }
      if(!mysqlAdmin){mysqlChild.kill();throw new Error('Managed MySQL startup timed out')}
    }
    const api=environment('backend.env');
    start('backend','dist/src/start.js',{...api,PRODUCTION_PORT:String(settings.backendPort),DEVELOPMENT_PORT:String(settings.backendPort),PORT:String(settings.backendPort)});
    start('frontend','server.js',{...environment('frontend.env'),NODE_ENV:'production',HOSTNAME:'127.0.0.1',PORT:String(settings.frontendPort)});
    async function wait(port,route){for(let i=0;i<180;i++){if(stopping)throw new Error('Application stopped; check logs.');const status=await new Promise(resolve=>{const req=http.get(`http://127.0.0.1:${port}${route}`,res=>{res.resume();resolve(res.statusCode)});req.on('error',()=>resolve(0));req.setTimeout(2000,()=>req.destroy());});if(status&&status<500)return;await new Promise(resolve=>setTimeout(resolve,1000));}throw new Error(`Startup timed out on port ${port}; check logs.`);}
    await wait(settings.backendPort,'/');await wait(settings.frontendPort,'/authentications/login');
    fs.writeFileSync(path.join(root,'ready.json'),JSON.stringify({readyAt:new Date().toISOString(),frontendPort:settings.frontendPort,backendPort:settings.backendPort}));
    console.log(`PLS ready: http://127.0.0.1:${settings.frontendPort}`);
    if(!process.env.PLS_NO_OPEN_BROWSER)spawn('explorer.exe',[`http://127.0.0.1:${settings.frontendPort}`],{windowsHide:true,stdio:'ignore'}).unref();
  } catch(error){stop();throw error;}
}
main().catch(error=>{console.error(error.message);process.exitCode=1;});
'@
$installerFile = Join-Path $target 'build-distribution.cjs'
Set-Content -LiteralPath $installerFile -Value $installer -Encoding UTF8
& node $installerFile
if ($LASTEXITCODE -ne 0) { throw "Deployment failed. The isolated checkout is retained inside $target; your original codebase has not been changed." }
Remove-Item -LiteralPath $installerFile
Write-Host "Installation complete. Restart using $(Join-Path $target 'Start-PLS.cmd')"
