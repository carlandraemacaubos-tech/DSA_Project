// ============================================================
// PART 12: Resource Storage and Seed Bank
// Python source for Pyodide.
// ============================================================

window.topicTemplates = window.topicTemplates || {};

window.topicTemplates[12] = {
    title: "Resource Storage and Seed Bank",
    code: String.raw`# Topic 12: Additional Module
class Plant:
    def __init__(self, name, water_need, health):
        self.name = name
        self.water_need = water_need
        self.health = 100
        print(f"The plant {name} successfully planted")

updateResources(
   water = 200,
   seeds = 90,
   energy = 110,
   hope = 80,
   coins = 990
)

addPlantsToDropdown([
   ("Rose", "🌹", 120)
])

print("Resource Storage and Plant dropdown unlocked!")
`
};
