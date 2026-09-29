package app;

import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.Optional;
import com.sun.net.httpserver.HttpServer;
import io.github.cdimascio.dotenv.Dotenv;
import lombok.extern.slf4j.Slf4j;
import util.Util;

@Slf4j
public class Main {

    public Main() {
    }

    public static void main(String[] args) throws Exception {
        Util util = new Util();

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

            log.info("response: " + response);
        });

        server.start();

        log.info(util.getName());
        log.info("Servidor iniciado en http://localhost:" + port);

    }
}