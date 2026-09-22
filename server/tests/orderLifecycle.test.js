import assert from "assert";

const allowedTransitions = {
  placed: ["confirmed", "rejected", "cancelled"],
  confirmed: ["preparing", "cancelled"],
  preparing: ["ready_for_pickup"],
  ready_for_pickup: ["rider_assigned", "cancelled"],
  rider_assigned: ["picked_up", "cancelled"],
  picked_up: ["on_the_way", "delivered"],
  on_the_way: ["delivered"],
};

function canTransition(currentStatus, nextStatus) {
  return (allowedTransitions[currentStatus] || []).includes(nextStatus);
}

function run() {
  assert.strictEqual(canTransition("placed", "confirmed"), true);
  assert.strictEqual(canTransition("preparing", "ready_for_pickup"), true);
  assert.strictEqual(canTransition("ready_for_pickup", "rider_assigned"), true);
  assert.strictEqual(canTransition("rider_assigned", "picked_up"), true);
  assert.strictEqual(canTransition("picked_up", "delivered"), true);
  assert.strictEqual(canTransition("placed", "rejected"), true);
  assert.strictEqual(canTransition("placed", "cancelled"), true);
  assert.strictEqual(canTransition("confirmed", "rejected"), false);
  assert.strictEqual(canTransition("delivered", "cancelled"), false);
}

run();
console.log("order lifecycle transitions ok");
