package main

import (
	"fmt"
	"io"
	"log"
	"os"
	"os/exec"
	"path/filepath"
)

func main() {
	fmt.Println("🚀 Starting Lobnos LIMS Deployment Process")
	fmt.Println("==========================================")

	// Get the launcher directory (where this executable is located)
	launcherDir, err := getExecutableDir()
	if err != nil {
		log.Fatalf("Failed to get launcher directory: %v", err)
	}

	// Find the main application directory
	appDir, err := findAppDirectory(launcherDir)
	if err != nil {
		log.Fatalf("Failed to find application directory: %v", err)
	}

	fmt.Printf("📁 Application directory: %s\n", appDir)
	fmt.Printf("📁 Launcher directory: %s\n", launcherDir)

	// Step 1: Delete existing .next folder in launcher
	fmt.Println("\n🗑️  Step 1: Cleaning old .next folder from launcher...")
	if err := deleteLauncherNext(launcherDir); err != nil {
		log.Fatalf("Failed to clean launcher .next folder: %v", err)
	}
	fmt.Println("✅ Old .next folder removed from launcher")

	// Step 1.5: Delete existing .next folder in application directory
	fmt.Println("\n🧹 Step 1.5: Cleaning old .next folder from application...")
	if err := deleteAppNext(appDir); err != nil {
		log.Fatalf("Failed to clean application .next folder: %v", err)
	}
	fmt.Println("✅ Old .next folder removed from application")

	// Step 1.6: Verify both .next folders are actually deleted
	fmt.Println("\n🔍 Step 1.6: Verifying cleanup...")
	if err := verifyCleanup(launcherDir, appDir); err != nil {
		log.Fatalf("Cleanup verification failed: %v", err)
	}
	fmt.Println("✅ Both .next folders successfully removed")

	// Step 2: Build the application
	fmt.Println("\n🔨 Step 2: Building Next.js application...")
	if err := buildApplication(appDir); err != nil {
		log.Fatalf("Failed to build application: %v", err)
	}
	fmt.Println("✅ Application built successfully")

	// Step 3: Copy new .next folder to launcher
	fmt.Println("\n📋 Step 3: Copying built .next folder to launcher...")
	if err := copyNextToLauncher(appDir, launcherDir); err != nil {
		log.Fatalf("Failed to copy .next folder to launcher: %v", err)
	}
	fmt.Println("✅ .next folder copied to launcher")

	fmt.Println("\n🎉 Deployment completed successfully!")
	fmt.Println("==========================================")
	fmt.Println("Your application is now ready for secure deployment.")
	fmt.Println("Run: .\\launcher-secure.exe")
}

func getExecutableDir() (string, error) {
	execPath, err := os.Executable()
	if err != nil {
		return "", err
	}
	return filepath.Dir(execPath), nil
}

func findAppDirectory(launcherDir string) (string, error) {
	// Look for the main application directory
	possiblePaths := []string{
		filepath.Dir(launcherDir), // Parent directory of launcher
		filepath.Join(launcherDir, "..", "lobnos"),
	}

	for _, appPath := range possiblePaths {
		if _, err := os.Stat(filepath.Join(appPath, "package.json")); err == nil {
			// Found package.json, this is likely the app directory
			// Don't check for .next since we might be cleaning it up
			return appPath, nil
		}
	}

	return "", fmt.Errorf("application directory not found")
}

func deleteLauncherNext(launcherDir string) error {
	// The .next folder is in cmd/launcher/, not directly in launcher/
	launcherNextPath := filepath.Join(launcherDir, "cmd", "launcher", ".next")
	if _, err := os.Stat(launcherNextPath); err == nil {
		// Directory exists, remove it
		fmt.Printf("Removing existing .next folder: %s\n", launcherNextPath)
		return os.RemoveAll(launcherNextPath)
	}
	// Directory doesn't exist, nothing to do
	fmt.Println("No existing .next folder found in launcher directory")
	return nil
}

func deleteAppNext(appDir string) error {
	appNextPath := filepath.Join(appDir, ".next")
	if _, err := os.Stat(appNextPath); err == nil {
		// Directory exists, remove it
		fmt.Printf("Removing existing .next folder: %s\n", appNextPath)
		return os.RemoveAll(appNextPath)
	}
	// Directory doesn't exist, nothing to do
	fmt.Println("No existing .next folder found in application directory")
	return nil
}

func verifyCleanup(launcherDir, appDir string) error {
	launcherNextPath := filepath.Join(launcherDir, "cmd", "launcher", ".next")
	appNextPath := filepath.Join(appDir, ".next")

	// Check launcher .next folder
	if _, err := os.Stat(launcherNextPath); err == nil {
		return fmt.Errorf("launcher .next folder still exists: %s", launcherNextPath)
	}

	// Check application .next folder
	if _, err := os.Stat(appNextPath); err == nil {
		return fmt.Errorf("application .next folder still exists: %s", appNextPath)
	}

	fmt.Println("✅ Verified: No .next folders remain")
	return nil
}

func buildApplication(appDir string) error {
	// Change to application directory
	if err := os.Chdir(appDir); err != nil {
		return fmt.Errorf("failed to change to app directory: %w", err)
	}

	// Run npm run build
	cmd := exec.Command("npm", "run", "build")
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr

	fmt.Println("Running: npm run build")
	if err := cmd.Run(); err != nil {
		return fmt.Errorf("build command failed: %w", err)
	}

	return nil
}

func copyNextToLauncher(appDir, launcherDir string) error {
	sourceDir := filepath.Join(appDir, ".next")
	// Copy to cmd/launcher/.next, not directly to launcher/.next
	targetDir := filepath.Join(launcherDir, "cmd", "launcher", ".next")

	// Ensure source exists
	if _, err := os.Stat(sourceDir); os.IsNotExist(err) {
		return fmt.Errorf("source .next directory does not exist: %s", sourceDir)
	}

	// Copy directory recursively
	return copyDir(sourceDir, targetDir)
}

func copyDir(src, dst string) error {
	// Get properties of source dir
	info, err := os.Stat(src)
	if err != nil {
		return err
	}

	// Create destination directory
	if err := os.MkdirAll(dst, info.Mode()); err != nil {
		return err
	}

	// Read source directory
	entries, err := os.ReadDir(src)
	if err != nil {
		return err
	}

	for _, entry := range entries {
		srcPath := filepath.Join(src, entry.Name())
		dstPath := filepath.Join(dst, entry.Name())

		if entry.IsDir() {
			// Recursively copy subdirectory
			if err := copyDir(srcPath, dstPath); err != nil {
				return err
			}
		} else {
			// Copy file
			if err := copyFile(srcPath, dstPath); err != nil {
				return err
			}
		}
	}

	return nil
}

func copyFile(src, dst string) error {
	srcFile, err := os.Open(src)
	if err != nil {
		return err
	}
	defer srcFile.Close()

	dstFile, err := os.Create(dst)
	if err != nil {
		return err
	}
	defer dstFile.Close()

	_, err = io.Copy(dstFile, srcFile)
	if err != nil {
		return err
	}

	// Copy file permissions
	srcInfo, err := srcFile.Stat()
	if err != nil {
		return err
	}

	return os.Chmod(dst, srcInfo.Mode())
}
