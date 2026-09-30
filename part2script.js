// ============================================================
// PART 2: Queues & Deques (FIFO Elements)
// Python source for Pyodide.
// ============================================================

window.topicTemplates = window.topicTemplates || {};

window.topicTemplates[2] = {
    title: "Queues & Deques (FIFO Elements)",
    code: String.raw`# Topic 2: Queues & Deques (FIFO Elements)
# Random Weather + Climate Effects
# Weather is generated one event at a time.

from collections import deque
import random

class ClimateEvent:
    def __init__(self, name, severity, water_effect=0, energy_effect=0, plant_health_effect=0):
        self.name = name
        self.severity = severity
        self.water_effect = water_effect
        self.energy_effect = energy_effect
        self.plant_health_effect = plant_health_effect

    def description(self):
        effects = []
        if self.water_effect > 0:
            effects.append(f"+{self.water_effect} Water")
        elif self.water_effect < 0:
            effects.append(f"{self.water_effect} Water")
        if self.energy_effect > 0:
            effects.append(f"+{self.energy_effect} Energy")
        elif self.energy_effect < 0:
            effects.append(f"{self.energy_effect} Energy")
        if self.plant_health_effect > 0:
            effects.append(f"+{self.plant_health_effect} Plant Health")
        elif self.plant_health_effect < 0:
            effects.append(f"{self.plant_health_effect} Plant Health")
        return f"{self.name} [{self.severity}] -> {' | '.join(effects)}"

class ClimateQueue:
    def __init__(self):
        self.queue = deque()
        self.water = 200
        self.energy = 110

    def enqueue(self, event):
        self.queue.append(event)

    def enqueue_priority(self, event):
        self.queue.appendleft(event)

    def dequeue(self):
        if self.queue:
            return self.queue.popleft()
        return None

    def peek(self):
        if self.queue:
            return self.queue[0]
        return None

    def size(self):
        return len(self.queue)

    def is_empty(self):
        return len(self.queue) == 0

    def update_display(self):
        updateClimateQueue([event.description() for event in self.queue])

    def generate_random_weather(self):
        return random.choice([
            ClimateEvent("Sunny", "Low", 0, 10, 5),
            ClimateEvent("Cloudy", "Low", 5, -5, 2),
            ClimateEvent("Light Rain", "Moderate", 20, -5, 8),
            ClimateEvent("Heavy Rain", "High", 40, -15, -3),
            ClimateEvent("Drought", "High", -30, -10, -15),
            ClimateEvent("Heatwave", "Critical", -40, -20, -25)
        ])

    def process_next(self):
        event = self.dequeue()
        if event is None:
            return None
        self.water = max(0, min(200, self.water + event.water_effect))
        self.energy = max(0, min(120, self.energy + event.energy_effect))
        updateResources(water=self.water, seeds=90, energy=self.energy, hope=80, coins=currentCoinsFromSimulator())
        self.update_display()
        return event

    def next_weather(self):
        event = self.generate_random_weather()
        self.enqueue(event)
        self.update_display()
        return self.process_next()

climate_queue = ClimateQueue()

print("Climate Queue ready!")
print("Queue rule: FIFO")
print("Deque supports appendleft for priority events.")
print("Simulator can generate one random weather at a time.")
`
};
