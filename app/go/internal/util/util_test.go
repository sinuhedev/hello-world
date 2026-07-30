package util_test

import (
	"fmt"
	"hello-world-go/internal/util"
	"testing"
)

func TestGreeting(t *testing.T) {
	tests := []struct {
		name     string
		input    string
		expected string
	}{
		{"default world", "", "Hello, World!"},
		{"custom name", "Gopher", "Hello, Gopher!"},
		{"unicode name", "世界", "Hello, 世界!"},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			got := util.Greeting(tc.input)
			if got != tc.expected {
				t.Errorf("Greeting(%q) = %q; want %q", tc.input, got, tc.expected)
			}
		})
	}
}

func TestLog(t *testing.T) {
	fmt.Printf("hello test")
}
