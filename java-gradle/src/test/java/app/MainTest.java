package app;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import org.junit.jupiter.api.Test;

public class MainTest {

  @Test
  void test() {
    System.out.println("hola");
    System.out.println("hooooo");
  }

  @Test
  public void myTest() {
    var m = new Main();
    assertNotNull(m);

    Main.main(new String[] {});

  }

}
