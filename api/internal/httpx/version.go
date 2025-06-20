package httpx

import (
	"os"
	"runtime"
)

var (
	Commit     = "dev"
	DeployedAt = "unknown"
)

func Info() map[string]string {
	hostname, _ := os.Hostname()
	return map[string]string{
		"commit":     Commit,
		"deployedAt": DeployedAt,
		"goVersion":  runtime.Version(),
		"goOS":       runtime.GOOS,
		"goArch":     runtime.GOARCH,
		"hostname":   hostname,
	}
}

func String() string {
	return Commit + " @ " + DeployedAt
}
