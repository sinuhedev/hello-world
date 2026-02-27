package app;

import io.github.cdimascio.dotenv.Dotenv;
import lombok.extern.slf4j.Slf4j;

@Slf4j
public class Main {

    public Main() {
    }

    public static void main(String[] args) {
        
        Dotenv dotenv = Dotenv.configure()
        .filename(".env")
        .ignoreIfMissing()
        .load();
        
        log.info("Hello " + dotenv.get("MESSAGE"));

    }
}
