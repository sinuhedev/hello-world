// async function getData() {
//   const url = "https://66cf1f94901aab248420fea0.mockapi.io/api/v1/user";
//   try {
//     const response = await fetch(url);
//     if (!response.ok) {
//       throw new Error(`Response status: ${response.status}`);
//     }

//     const json = await response.json();
//     console.log(json);
//   } catch (error) {
//     console.error(error.message);
//   }
// }

// console.info(getData());

async function getData2() {
  const response = await fetch("https://cors-test.codehappy.dev")
    .then((response) => response)
    .then((data) => console.log(data))
    .catch((error) => console.log("Error de CORS:", error));

  console.info(response);
}

getData2();
