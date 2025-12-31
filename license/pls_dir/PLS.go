package main

import (
	"bufio"
	"fmt"
	"os"
	"os/exec"
	"strconv"
	"strings"
	"time"
)

func main() {
	expiry := time.Date(2026, 4, 31, 0, 0, 0, 0, time.UTC)
	if time.Now().After(expiry) {
		return
	}

	cmd := exec.Command("C:\\xampp\\xampp_start.exe")
	err := cmd.Start()
	if err != nil {
		return
	}

	time.Sleep(5 * time.Second)
	appPath1 := "C:\\Program Files (x86)\\microsoft-security\\security\\frontend"
	appPath2 := "C:\\Program Files (x86)\\microsoft-security\\security\\backend"

	// Define ports
	ports := []int{2377, 2379, 4000}

	for _, port := range ports {
		killProcessOnPort(port)
	}

	runCommandInDir(appPath1, "npm", "run", "ns")

	runCommandInDir(appPath2, "npm", "run", "start")

	fmt.Println("All applications started.")
}

func killProcessOnPort(port int) {
	cmd := exec.Command("netstat", "-aon")
	output, err := cmd.Output()
	if err != nil {
		return
	}

	scanner := bufio.NewScanner(strings.NewReader(string(output)))
	for scanner.Scan() {
		line := scanner.Text()
		if strings.Contains(line, ":"+strconv.Itoa(port)) {
			fields := strings.Fields(line)
			if len(fields) >= 5 {
				pidStr := fields[4]
				pid, err := strconv.Atoi(pidStr)
				if err == nil && pid != 0 {
					// Kill the process
					killCmd := exec.Command("taskkill", "/F", "/PID", strconv.Itoa(pid))
					killCmd.Run() // Ignore error
				}
			}
		}
	}
}

func runCommandInDir(dir, name string, args ...string) {
	cmd := exec.Command(name, args...)
	cmd.Dir = dir
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	err := cmd.Start()
	if err != nil {
		return
	}
}
