import {NextRequest,NextResponse} from 'next/server';
import {getServerRequestContext as getRequestContext} from '../../../../lib/serverRequestContext';
import {getBackendAuthorization} from '../../../../lib/serverBackendAccess';
import {POST as establishSession} from '../login/route';
export async function POST(request:NextRequest){
 if(request.headers.get('origin')!==request.nextUrl.origin)return NextResponse.json({error:'Invalid request origin'},{status:403});
 try{
  const context=await getRequestContext();if(!context?.PLS_PRIME_TENANT_SESSION||!context.tenantId)return NextResponse.json({error:'Sign in again to switch roles'},{status:401});
  const input=await request.json();const base=process.env.NODE_ENV==='development'?process.env.DEVELOPMENT_BASEURL:process.env.PRODUCTION_BASEURL;
  if(!base)throw Error('Backend is not configured');
  const url=new URL('prime/switch-role',base);url.searchParams.set('tenantId',String(context.tenantId));
  const auth=getBackendAuthorization();const r=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json','pls-prime-tenant-session':context.PLS_PRIME_TENANT_SESSION,...(auth?{Authorization:auth}:{})},body:JSON.stringify({role:input.role,branchid:input.branchid}),cache:'no-store'});
  const result=await r.json();if(!r.ok||!result.success)return NextResponse.json({error:result.error?.message||result.message||'Role switch failed'},{status:r.status>=400?r.status:400});
  return establishSession(new NextRequest(new URL('/api/auth/login',request.url),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({status:true,accessToken:result.data.accessToken,tenantId:context.tenantId,loginsessionId:context.loginsessionId})}));
 }catch{return NextResponse.json({error:'The role switch could not be confirmed. Sign in again before continuing.'},{status:502});}
}
