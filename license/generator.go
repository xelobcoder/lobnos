package main

import (
	"bufio"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"os"
	"os/exec"
	"strconv"
	"strings"

	"github.com/joho/godotenv"
)

func isLeapYear(year int) bool {
	return year%4 == 0 && (year%100 != 0 || year%400 == 0)
}

func isValidDate(dateStr string) bool {
	parts := strings.Split(dateStr, "-")
	if len(parts) != 3 {
		return false
	}
	year, err1 := strconv.Atoi(parts[0])
	month, err2 := strconv.Atoi(parts[1])
	day, err3 := strconv.Atoi(parts[2])
	if err1 != nil || err2 != nil || err3 != nil {
		return false
	}
	if year < 1900 || year > 2100 || month < 1 || month > 12 || day < 1 || day > 31 {
		return false
	}
	daysInMonth := []int{31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31}
	if month == 2 && isLeapYear(year) {
		daysInMonth[1] = 29
	}
	if day > daysInMonth[month-1] {
		return false
	}
	return true
}

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

func main() {
	// Load environment variables from .env file
	err := godotenv.Load()
	if err != nil {
		fmt.Println("Error loading .env file:", err)
		return
	}

	cpuId := getWmicValue("cpu get ProcessorId /value")
	diskSerial := getWmicValue("diskdrive get SerialNumber /value")
	motherboardSerial := getWmicValue("baseboard get SerialNumber /value")

	hardwareFingerprint := cpuId + diskSerial + motherboardSerial

	systemDrive := os.Getenv("SystemDrive")
	folderPath := systemDrive + "\\advanced\\prime-lab-system"
	err = os.MkdirAll(folderPath, 0755)
	if err != nil && !os.IsExist(err) {
		fmt.Println("Error creating folder:", err)
		return
	}

	var expiryDate string
	for {
		fmt.Print("Enter expiry date (YYYY-MM-DD): ")
		scanner := bufio.NewScanner(os.Stdin)
		scanner.Scan()
		expiryDate = strings.TrimSpace(scanner.Text())

		if !isValidDate(expiryDate) {
			fmt.Println("Invalid date. Please enter a valid date in YYYY-MM-DD format (e.g., 2026-12-31)")
			continue
		}
		break
	}

	// Read password from environment variable instead of prompting
	password := os.Getenv("LICENSE_PASSWORD")
	if password == "" {
		fmt.Println("Error: LICENSE_PASSWORD not set in .env file")
		return
	}
	if password != "PrimeLabTiifuHamza" {
		fmt.Println("Invalid password")
		return
	}

	hash := sha256.Sum256([]byte(folderPath + expiryDate))
	hashedPath := hex.EncodeToString(hash[:])

	appPath := systemDrive + "\\microsoft-security\\targets\\multi\\runner"
	err = os.MkdirAll(appPath, 0777)
	if err != nil && !os.IsExist(err) {
		fmt.Println("Error creating app folder:", err)
		return
	}
	err = os.Chmod(appPath, 0777)
	if err != nil {
		fmt.Println("Error setting permissions:", err)
		return
	}

	clientPath := appPath + "\\client"
	err = os.MkdirAll(clientPath, 0777)
	if err != nil && !os.IsExist(err) {
		fmt.Println("Error creating client folder:", err)
		return
	}
	err = os.Chmod(clientPath, 0777)
	if err != nil {
		fmt.Println("Error setting client permissions:", err)
		return
	}

	serverPath := appPath + "\\server"
	err = os.MkdirAll(serverPath, 0777)
	if err != nil && !os.IsExist(err) {
		fmt.Println("Error creating server folder:", err)
		return
	}
	err = os.Chmod(serverPath, 0777)
	if err != nil {
		fmt.Println("Error setting server permissions:", err)
		return
	}

	appHash := sha256.Sum256([]byte(appPath + expiryDate))
	hashedAppPath := hex.EncodeToString(appHash[:])

	licenseFilePath := folderPath + "\\license.dat"
	file, err := os.Create(licenseFilePath)
	if err != nil {
		fmt.Println("Error creating license.dat:", err)
		return
	}
	defer file.Close()

	_, err = fmt.Fprintf(file, "%s\n%s\n%s\n%s\n", hardwareFingerprint, hashedPath, hashedAppPath, expiryDate)
	if err != nil {
		fmt.Println("Error writing to license.dat:", err)
		return
	}

	fmt.Println("License generated successfully in", licenseFilePath)
}
