package app;

import com.sun.net.httpserver.HttpServer;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.Optional;

import io.github.cdimascio.dotenv.Dotenv;
import lombok.extern.slf4j.Slf4j;

@Slf4j
public class Main {

    public Main() {
    }

    public static void main(String[] args) throws Exception {

        Dotenv dotenv = Dotenv.configure().filename(".env").ignoreIfMissing().load();
        int port = Optional.ofNullable(dotenv.get("PORT"))
                .map(Integer::parseInt)
                .orElse(3000);

        var server = HttpServer.create(new InetSocketAddress(port), 0);

        server.createContext("/", exchange -> {
            var response = "Hello World!";

            exchange.getResponseHeaders().add("Content-Type", "text/plain; charset=UTF-8");
            exchange.sendResponseHeaders(200, response.getBytes(StandardCharsets.UTF_8).length);

            try (var os = exchange.getResponseBody()) {
                os.write(response.getBytes(StandardCharsets.UTF_8));
            }
        });

        server.start();

        log.info("Servidor iniciado en http://localhost:" + port);

    }
}
