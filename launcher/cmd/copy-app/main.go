package main

import (
	"archive/zip"
	"crypto/aes"
	"crypto/cipher"
	"encoding/base64"
	"fmt"
	"io"
	"log"
	"os"
	"path/filepath"
	"strings"
)

const aesKey = "12345678901234567890123456789012"

type LaunchConfig struct {
	AppPath           string
	ExpectedBuildHash string
}

func loadLaunchConfig(configPath string) (*LaunchConfig, error) {
	data, err := os.ReadFile(configPath)
	if err != nil {
		return nil, fmt.Errorf("failed to read config file: %w", err)
	}
	if err != nil {
		return nil, fmt.Errorf("failed to read config file: %w", err)
	}

	config := &LaunchConfig{}
	lines := strings.Split(string(data), "\n")
	for _, line := range lines {
		line = strings.TrimSpace(line)
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}
		parts := strings.SplitN(line, "=", 2)
		if len(parts) != 2 {
			continue
		}
		key := strings.TrimSpace(parts[0])
		value := strings.TrimSpace(parts[1])
		switch key {
		case "appPath":
			decrypted, err := decryptAES(value)
			if err != nil {
				return nil, fmt.Errorf("failed to decrypt appPath: %w", err)
			}
			config.AppPath = strings.Replace(decrypted, "%USERNAME%", os.Getenv("USERNAME"), -1)
		case "expectedBuildHash":
			config.ExpectedBuildHash = value
		}
	}

	if config.AppPath == "" {
		return nil, fmt.Errorf("missing appPath in config")
	}

	return config, nil
}

func decryptAES(ciphertext string) (string, error) {
	data, err := base64.StdEncoding.DecodeString(ciphertext)
	if err != nil {
		return "", err
	}
	block, err := aes.NewCipher([]byte(aesKey))
	if err != nil {
		return "", err
	}
	if len(data) < aes.BlockSize {
		return "", fmt.Errorf("ciphertext too short")
	}
	iv := data[:aes.BlockSize]
	data = data[aes.BlockSize:]
	stream := cipher.NewCFBDecrypter(block, iv)
	stream.XORKeyStream(data, data)
	return string(data), nil
}

func copyFile(src, dst string) error {
	sourceFile, err := os.Open(src)
	if err != nil {
		return err
	}
	defer sourceFile.Close()

	destFile, err := os.Create(dst)
	if err != nil {
		return err
	}
	defer destFile.Close()

	_, err = io.Copy(destFile, sourceFile)
	return err
}

func main() {
	config, err := loadLaunchConfig("launcher.config")
	if err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}

	// Ensure target directory is empty
	if _, err := os.Stat(config.AppPath); err == nil {
		fmt.Println("Clearing target directory contents...")
		files, err := os.ReadDir(config.AppPath)
		if err == nil {
			for _, file := range files {
				path := filepath.Join(config.AppPath, file.Name())
				if err := os.RemoveAll(path); err != nil {
					fmt.Printf("Warning: failed to remove %s: %v\n", path, err)
				}
			}
		}
		fmt.Println("Target directory cleared.")
	} else {
		// Create directory if it doesn't exist
		if err := os.MkdirAll(config.AppPath, 0755); err != nil {
			log.Fatalf("Failed to create target directory: %v", err)
		}
	}

	// Create production subfolder
	productionPath := filepath.Join(config.AppPath, "production")
	if err := os.MkdirAll(productionPath, 0755); err != nil {
		log.Fatalf("Failed to create production directory: %v", err)
	}

	targetPath := filepath.Join(config.AppPath, "production.zip")

	fmt.Println("Copying production.zip to secure location...")
	if err := copyFile("production.zip", targetPath); err != nil {
		log.Fatalf("Failed to copy production.zip: %v", err)
	}

	fmt.Println("Application package copied successfully.")

	fmt.Println("Extracting application package...")
	if err := unzip(targetPath, config.AppPath); err != nil {
		log.Fatalf("Failed to extract production.zip: %v", err)
	}

	fmt.Println("Application package extracted successfully.")
}

func unzip(zipPath, destDir string) error {
	reader, err := zip.OpenReader(zipPath)
	if err != nil {
		return err
	}
	defer reader.Close()

	for _, file := range reader.File {
		path := filepath.Join(destDir, file.Name)
		if file.FileInfo().IsDir() {
			os.MkdirAll(path, file.Mode())
			continue
		}

		if err := os.MkdirAll(filepath.Dir(path), 0755); err != nil {
			return err
		}

		outFile, err := os.Create(path)
		if err != nil {
			return err
		}
		defer outFile.Close()

		rc, err := file.Open()
		if err != nil {
			return err
		}
		defer rc.Close()

		_, err = io.Copy(outFile, rc)
		if err != nil {
			return err
		}

		outFile.Close()
		rc.Close()
	}

	return nil
}
