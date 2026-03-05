function fizzbuzz(n: number): string {
  if (n % 15 === 0) return "FizzBuzz";
  if (n % 3 === 0) return "Fizz";
  if (n % 5 === 0) return "Buzz";
  return String(n);
}

function generateFizzBuzz(from: number, to: number): string[] {
  const results: string[] = [];
  for (let i = from; i <= to; i++) {
    results.push(fizzbuzz(i));
  }
  return results;
}

function getType(value: string): string {
  if (value === "FizzBuzz") return "fizzbuzz";
  if (value === "Fizz") return "fizz";
  if (value === "Buzz") return "buzz";
  return "number";
}

const app = document.getElementById("app")!;
const ol = document.createElement("ol");

for (const value of generateFizzBuzz(1, 100)) {
  const li = document.createElement("li");
  li.textContent = value;
  li.dataset.type = getType(value);
  ol.appendChild(li);
}

app.appendChild(ol);
