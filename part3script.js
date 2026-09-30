// ============================================================
// PART 3: Static/Dynamic Arrays, 2D Lists, & Memory Structures
// Python source for Pyodide.
// ============================================================

window.topicTemplates = window.topicTemplates || {};

window.topicTemplates[3] = {
    title: "Static/Dynamic Arrays, 2D Lists, & Memory Structures",
    code: String.raw`# Topic 3: Static/Dynamic Arrays, 2D Lists, & Memory Structures
# Plant memory belongs here, not in Topic 2.

class Plant:
    def __init__(self, name, water_need, health=100):
        self.name = name
        self.water_need = water_need
        self.health = health

    def apply_weather_effect(self, amount):
        self.health = max(0, min(100, self.health + amount))

    def get_status(self):
        if self.health >= 70:
            return "Healthy"
        if self.health >= 40:
            return "Weak"
        return "Critical"

    def display(self):
        return f"{self.name} | Health: {self.health}/100 | {self.get_status()}"

GARDEN_SIZE = 25
ROWS = 5
COLUMNS = 5

garden_memory = [None] * GARDEN_SIZE
plant_memory = []
garden_2d = [[None for _ in range(COLUMNS)] for _ in range(ROWS)]

def position_to_2d(position):
    return position // COLUMNS, position % COLUMNS

def position_to_index(row, column):
    return row * COLUMNS + column

def add_plant(position, name, water_need):
    if position < 0 or position >= GARDEN_SIZE:
        return None
    if garden_memory[position] is not None:
        return None
    plant = Plant(name, water_need)
    garden_memory[position] = plant
    plant_memory.append(plant)
    row, column = position_to_2d(position)
    garden_2d[row][column] = plant
    addPlantToGrid(position, name)
    return plant

def remove_plant(position):
    if position < 0 or position >= GARDEN_SIZE:
        return None
    plant = garden_memory[position]
    if plant is None:
        return None
    row, column = position_to_2d(position)
    garden_memory[position] = None
    garden_2d[row][column] = None
    if plant in plant_memory:
        plant_memory.remove(plant)
    return plant

def display_memory():
    print("1D Memory:")
    for i, plant in enumerate(garden_memory):
        if plant is not None:
            print(i, plant.display())

def display_2d_garden():
    print("2D Garden Memory:")
    for row in garden_2d:
        print([plant.name if plant else "Empty" for plant in row])

print("Garden memory ready: 25 positions, 5x5 2D structure.")
`
};
