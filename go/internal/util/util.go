package util

func Greeting(name string) string {
	if name == "" {
		name = "World"
	}
	return "Hello, " + name + "!"
}
