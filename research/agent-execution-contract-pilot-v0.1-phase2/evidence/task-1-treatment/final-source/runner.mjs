const scenarios = [
  {
    name: "ordinary success",
    run() {},
  },
  {
    name: "another ordinary success",
    run() {},
  },
  {
    name: "expected failure",
    expectedFailure: true,
    run() {
      throw new Error("intentional expected failure");
    },
  },
];

const selectedName = process.argv[2] === "--scenario" ? process.argv[3] : null;
const selected = selectedName
  ? scenarios.filter((scenario) => scenario.name === selectedName)
  : scenarios;

if (selectedName && selected.length === 0) {
  throw new Error(`unknown scenario: ${selectedName}`);
}

for (const scenario of selected) {
  try {
    scenario.run();
    console.log(`PASS ${scenario.name}`);
  } catch (error) {
    if (!scenario.expectedFailure) throw error;
    console.log(`EXPECTED FAILURE HANDLED ${scenario.name}`);
  }
}

console.log("All expected scenarios handled.");
