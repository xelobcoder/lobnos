### LOBNOS INTEGRADED LABORATORY SOFTWARE FOR SMALL TO MEDIUM CLINICAL LABORATORIES ###
 *This is a software for small to large facillity that helps to manage laboratories bith on premises and online *

## Build Protection

The application includes build protection to secure the compiled Next.js application code using encrypted archives:

### Creating Protected Build
After building the application, create a password-protected archive:
```bash
# Run the protection script
encrypt-build.bat
```

This will:
1. Build the Next.js application
2. Create a ZIP archive of the `.next` folder
3. Encrypt the archive with AES-256-GCM
4. Protect the application code from unauthorized access

### Running the Protected Application
Use the secure launcher to run the protected application:
```bash
launcher/launcher-secure.exe
```

The launcher will automatically extract the protected archive at startup.

### Security Features
- **AES-256-GCM encryption** on compressed archives
- **Single encrypted file** for fast protection/access
- **Automatic extraction** at application startup
- **Build integrity verification**
- **Machine fingerprint validation**
- **License-based access control**