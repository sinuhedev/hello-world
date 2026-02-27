package app;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import org.junit.jupiter.api.Test;

public class MainTest {

    @Test
    public void myTest() {
        var m = new Main();
        assertNotNull(m);
        Main.main(new String[]{});
    }

    @Test
    public void utest() {

        System.out.println("utest");
    }

}
