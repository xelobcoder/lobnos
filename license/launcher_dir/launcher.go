package main

import (
	"bufio"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"log"
	"os"
	"os/exec"
	"strings"
	"time"
)

func getWmicValue(command string) string {
	cmd := exec.Command("wmic", strings.Split(command, " ")...)
	output, err := cmd.Output()
	if err != nil {
		return ""
	}
	lines := strings.Split(string(output), "\n")
	for _, line := range lines {
		if strings.Contains(line, "=") {
			parts := strings.Split(line, "=")
			if len(parts) == 2 {
				return strings.TrimSpace(parts[1])
			}
		}
	}
	return ""
}

func logError(message string) {
	file, err := os.OpenFile("debug.log", os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0644)
	if err != nil {
		fmt.Println("Error creating debug.log:", err)
		return
	}
	defer file.Close()
	logger := log.New(file, "", log.LstdFlags)
	logger.Println(message)
}

func main() {
	systemDrive := os.Getenv("SystemDrive")
	// Known folder path
	folderPath := systemDrive + "\\advanced\\prime-lab-system"
	licenseFilePath := folderPath + "\\license.dat"

	// Read license.dat from the known folder
	file, err := os.Open(licenseFilePath)
	if err != nil {
		fmt.Println("Error opening license.dat:", err)
		logError("Error opening license.dat: " + err.Error())
		return
	}
	defer file.Close()

	scanner := bufio.NewScanner(file)
	var lines []string
	for scanner.Scan() {
		lines = append(lines, scanner.Text())
	}
	if err = scanner.Err(); err != nil {
		fmt.Println("Error reading license.dat:", err)
		logError("Error reading license.dat: " + err.Error())
		return
	}
	if len(lines) < 4 {
		fmt.Println("Invalid license.dat format")
		logError("Invalid license.dat format")
		return
	}

	storedHardware := lines[0]
	storedHashedPath := lines[1]
	storedHashedAppPath := lines[2]
	storedExpiryDate := lines[3]

	expiryTime, err := time.Parse("2006-01-02", storedExpiryDate)
	if err != nil {
		fmt.Println("Error parsing expiry date:", err)
		logError("Error parsing expiry date: " + err.Error())
		return
	}
	now := time.Now()
	if now.After(expiryTime) {
		fmt.Println("License has expired")
		logError("License has expired")
		return
	}

	// Compute current hardware fingerprint
	cpuId := getWmicValue("cpu get ProcessorId /value")
	diskSerial := getWmicValue("diskdrive get SerialNumber /value")
	motherboardSerial := getWmicValue("baseboard get SerialNumber /value")

	currentHardware := cpuId + diskSerial + motherboardSerial

	currentHash := sha256.Sum256([]byte(folderPath + storedExpiryDate))
	currentHashedPath := hex.EncodeToString(currentHash[:])

	appPath := systemDrive + "\\microsoft-security\\targets\\multi\\runner"
	currentAppHash := sha256.Sum256([]byte(appPath + storedExpiryDate))
	currentHashedAppPath := hex.EncodeToString(currentAppHash[:])

	// Verify
	if currentHardware != storedHardware || currentHashedPath != storedHashedPath || currentHashedAppPath != storedHashedAppPath {
		fmt.Println("License verification failed")
		logError("License verification failed")
		return
	}

	fmt.Println("License verified successfully")

	clientPath := appPath + "\\client"
	err = os.Chdir(clientPath)
	if err != nil {
		fmt.Println("Error changing directory to client:", err)
		logError("Error changing directory to client: " + err.Error())
		return
	}

	cmd := exec.Command("npm", "run", "ns")
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	err = cmd.Run()
	if err != nil {
		fmt.Println("Error running npm run ns:", err)
		logError("Error running npm run ns: " + err.Error())
		return
	}

	serverPath := appPath + "\\server"
	err = os.Chdir(serverPath)
	if err != nil {
		fmt.Println("Error changing directory to server:", err)
		logError("Error changing directory to server: " + err.Error())
		return
	}

	cmd = exec.Command("npm", "run", "start")
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	err = cmd.Run()
	if err != nil {
		fmt.Println("Error running npm run start:", err)
		logError("Error running npm run start: " + err.Error())
		return
	}

	fmt.Println("Node.js application built successfully")
}
