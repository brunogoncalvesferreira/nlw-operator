import { faker } from "@faker-js/faker";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { roastDiffLines, roastIssues, roasts } from "./schema";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
	console.error("DATABASE_URL is not set");
	process.exit(1);
}

const client = postgres(DATABASE_URL);
const db = drizzle(client, { casing: "snake_case" });

// ---------------------------------------------------------------------------
// Code snippets pool — realistic-ish code in various languages
// ---------------------------------------------------------------------------

const CODE_SNIPPETS: { code: string; language: string }[] = [
	{
		language: "javascript",
		code: `function fetchData(url) {
  var data = null;
  fetch(url).then(res => {
    data = res.json();
  });
  return data;
}`,
	},
	{
		language: "javascript",
		code: `app.get('/users', (req, res) => {
  db.query('SELECT * FROM users WHERE id = ' + req.params.id, (err, rows) => {
    res.json(rows);
  });
});`,
	},
	{
		language: "typescript",
		code: `const getUser = async (id: any) => {
  const res = await fetch('/api/users/' + id);
  const data: any = await res.json();
  return data;
};`,
	},
	{
		language: "typescript",
		code: `function processItems(items: any[]) {
  let result: any = {};
  for (let i = 0; i < items.length; i++) {
    result[items[i].id] = items[i];
  }
  return result;
}`,
	},
	{
		language: "python",
		code: `def get_user(id):
    import requests
    r = requests.get(f"http://api.example.com/users/{id}")
    eval(r.text)
    return r`,
	},
	{
		language: "python",
		code: `class UserService:
    def __init__(self):
        self.db = None

    def get_all(self):
        users = []
        for row in self.db.execute("SELECT * FROM users"):
            users.append(row)
        return users`,
	},
	{
		language: "java",
		code: `public class UserController {
    public String getUser(String id) {
        try {
            return db.query("SELECT * FROM users WHERE id = " + id);
        } catch (Exception e) {
            return null;
        }
    }
}`,
	},
	{
		language: "java",
		code: `public void processPayment(double amount) {
    if (amount > 0) {
        if (amount < 1000) {
            if (isValid()) {
                if (hasBalance()) {
                    charge(amount);
                }
            }
        }
    }
}`,
	},
	{
		language: "go",
		code: `func GetUser(w http.ResponseWriter, r *http.Request) {
	id := r.URL.Query().Get("id")
	row := db.QueryRow("SELECT * FROM users WHERE id = " + id)
	var user User
	row.Scan(&user.ID, &user.Name)
	json.NewEncoder(w).Encode(user)
}`,
	},
	{
		language: "go",
		code: `func processItems(items []Item) []Item {
	result := []Item{}
	for i := 0; i < len(items); i++ {
		for j := 0; j < len(items); j++ {
			if items[i].ID == items[j].ParentID {
				result = append(result, items[i])
			}
		}
	}
	return result
}`,
	},
	{
		language: "rust",
		code: `fn parse_config(path: &str) -> Config {
    let content = std::fs::read_to_string(path).unwrap();
    let config: Config = serde_json::from_str(&content).unwrap();
    config
}`,
	},
	{
		language: "rust",
		code: `fn process(data: Vec<String>) -> Vec<String> {
    let mut result = vec![];
    for item in data.clone() {
        let cloned = item.clone();
        result.push(cloned.clone());
    }
    result
}`,
	},
	{
		language: "css",
		code: `.container {
  width: 100%;
  padding: 10px;
  margin: 0 auto;
}
.container > div {
  float: left;
  width: 33.33%;
}
.clearfix::after { clear: both; }`,
	},
	{
		language: "html",
		code: `<div class="container">
  <div style="color: red; font-size: 14px; margin: 10px;">
    <div onclick="doSomething()">
      <marquee>Welcome to my website!</marquee>
    </div>
  </div>
</div>`,
	},
	{
		language: "php",
		code: `<?php
function getUser($id) {
    $conn = mysqli_connect("localhost", "root", "", "mydb");
    $result = mysqli_query($conn, "SELECT * FROM users WHERE id = $id");
    return mysqli_fetch_assoc($result);
}`,
	},
	{
		language: "ruby",
		code: `def send_email(user)
  begin
    mailer = Mailer.new
    mailer.send(user.email, "Hello")
  rescue => e
    puts e.message
    retry
  end
end`,
	},
	{
		language: "csharp",
		code: `public async Task<User> GetUser(int id)
{
    try {
        var user = await _context.Users.FindAsync(id);
        return user;
    } catch {
        return null;
    }
}`,
	},
	{
		language: "swift",
		code: `func fetchData(url: String) {
    let url = URL(string: url)!
    let data = try! Data(contentsOf: url)
    let json = try! JSONSerialization.jsonObject(with: data)
    print(json)
}`,
	},
	{
		language: "kotlin",
		code: `fun processOrder(order: Order?): String {
    if (order != null) {
        if (order.items != null) {
            if (order.items!!.isNotEmpty()) {
                return order.items!!.first()!!.name!!
            }
        }
    }
    return ""
}`,
	},
	{
		language: "sql",
		code: `SELECT u.*, o.*, p.*
FROM users u, orders o, products p
WHERE u.id = o.user_id
AND o.product_id = p.id
AND u.active = 1
ORDER BY u.name`,
	},
];

// ---------------------------------------------------------------------------
// Roast quotes pool — sarcastic commentary
// ---------------------------------------------------------------------------

const ROAST_QUOTES = [
	"I've seen better error handling in a toaster.",
	"This code doesn't have bugs, it IS the bug.",
	"Ah yes, the classic 'works on my machine' architecture.",
	"Even ChatGPT would be embarrassed to generate this.",
	"Your code is like a horror movie — I keep screaming but it won't stop.",
	"I'd say this needs refactoring, but that implies there was factoring to begin with.",
	"This isn't spaghetti code. Spaghetti at least has structure.",
	"The only design pattern here is 'chaos'.",
	"Did you write this with your eyes closed? Respect.",
	"Your variable naming convention is 'whatever comes to mind first'.",
	"SQL injection called, it wants to thank you for the warm welcome.",
	"This function does everything except what it's supposed to.",
	"I've seen cleaner code in a randomized fuzzer output.",
	"The try-catch here is purely decorative, like a doily.",
	"Your indentation tells a story. A tragedy, specifically.",
	"This is the coding equivalent of duct-taping a bridge.",
	"Congratulations, you've reinvented the wheel. But square.",
	"The only thing worse than this code is the commit message that shipped it.",
	"If this code were a building, it would fail inspection before the foundation dried.",
	"You didn't just ignore best practices, you actively fought them.",
	"This makes callback hell look like paradise.",
	"I'm not saying this is the worst code I've seen. I'm implying it.",
	"The performance of this code can be measured in geological time.",
	"Your error handling strategy appears to be 'hope'.",
	"This code violates principles that haven't even been invented yet.",
	"Somewhere, a CS professor just felt a disturbance in the force.",
	"The cyclomatic complexity here could power a small city.",
	"This code has more red flags than a bullfighting arena.",
	"I'd recommend a code review, but I'm not sure anyone should see this.",
	"The only thing DRY about this code is my sense of humor after reading it.",
];

// ---------------------------------------------------------------------------
// Issue templates pool
// ---------------------------------------------------------------------------

const ISSUE_TEMPLATES: {
	severity: "critical" | "warning" | "good";
	title: string;
	description: string;
}[] = [
	{
		severity: "critical",
		title: "SQL Injection Vulnerability",
		description:
			"String concatenation in SQL queries allows attackers to execute arbitrary database commands. Use parameterized queries instead.",
	},
	{
		severity: "critical",
		title: "Use of eval()",
		description:
			"eval() executes arbitrary code and is a massive security risk. There is almost never a valid reason to use it.",
	},
	{
		severity: "critical",
		title: "Credentials Hardcoded",
		description:
			"Database credentials are hardcoded in the source. Use environment variables or a secrets manager.",
	},
	{
		severity: "critical",
		title: "No Error Handling",
		description:
			"Errors are silently swallowed or ignored entirely. This makes debugging nearly impossible in production.",
	},
	{
		severity: "critical",
		title: "Race Condition",
		description:
			"Async operation results are used synchronously, leading to undefined behavior and intermittent bugs.",
	},
	{
		severity: "warning",
		title: "Using 'any' Type",
		description:
			"The 'any' type defeats the purpose of TypeScript. Define proper interfaces for your data structures.",
	},
	{
		severity: "warning",
		title: "Excessive Nesting",
		description:
			"Deeply nested conditionals reduce readability. Consider early returns or guard clauses.",
	},
	{
		severity: "warning",
		title: "No Input Validation",
		description:
			"User input is used directly without validation or sanitization. Always validate on the server side.",
	},
	{
		severity: "warning",
		title: "Unnecessary Cloning",
		description:
			"Data is cloned multiple times without reason, wasting memory and CPU cycles.",
	},
	{
		severity: "warning",
		title: "Implicit Returns",
		description:
			"Function return types are not explicit, making it unclear what callers should expect.",
	},
	{
		severity: "warning",
		title: "Using var Instead of const/let",
		description:
			"'var' has function scope which leads to subtle bugs. Use 'const' for immutable bindings and 'let' when reassignment is needed.",
	},
	{
		severity: "warning",
		title: "O(n\u00B2) Complexity",
		description:
			"Nested loops over the same collection result in quadratic time complexity. Consider using a Map for O(n) lookups.",
	},
	{
		severity: "warning",
		title: "Float Comparison",
		description:
			"Floating point numbers should not be compared with strict equality due to precision issues.",
	},
	{
		severity: "warning",
		title: "Missing Null Check",
		description:
			"Nullable values are accessed without checking, risking runtime crashes.",
	},
	{
		severity: "good",
		title: "Consistent Formatting",
		description:
			"The code follows a consistent indentation and formatting style. Keep it up.",
	},
	{
		severity: "good",
		title: "Descriptive Function Name",
		description:
			"The function name clearly communicates its purpose. Self-documenting code at its best.",
	},
	{
		severity: "good",
		title: "Async/Await Usage",
		description:
			"Using async/await instead of raw promises makes the control flow much clearer.",
	},
	{
		severity: "good",
		title: "Small Function Size",
		description:
			"The function is short and focused on a single responsibility. Easy to test and maintain.",
	},
];

// ---------------------------------------------------------------------------
// Diff line generator
// ---------------------------------------------------------------------------

const DIFF_REMOVED_LINES = [
	"  var data = null;",
	'  db.query("SELECT * FROM users WHERE id = " + id)',
	"  } catch (Exception e) { return null; }",
	"  eval(r.text)",
	"  float: left; width: 33.33%;",
	"  retry",
	"  let result: any = {};",
	"  .unwrap()",
	"  items[i].ID == items[j].ParentID",
	'  onclick="doSomething()"',
];

const DIFF_ADDED_LINES = [
	"  const data: User | null = null;",
	'  db.query("SELECT * FROM users WHERE id = $1", [id])',
	"  } catch (error) { logger.error(error); throw error; }",
	"  data = json.loads(r.text)",
	"  display: grid; grid-template-columns: repeat(3, 1fr);",
	"  raise RetryError(max_retries_exceeded)",
	"  const result: Record<string, Item> = {};",
	'  .context("Failed to parse config")?',
	"  itemMap.get(items[i].ParentID)",
	'  addEventListener("click", doSomething)',
];

const DIFF_CONTEXT_LINES = [
	"function fetchData(url: string) {",
	"  const response = await fetch(url);",
	"  return result;",
	"}",
	"  for (const item of items) {",
	"  if (!user) {",
	"    return res.status(404).json({ error: 'Not found' });",
	"  }",
	"  const config = loadConfig();",
	"  export default handler;",
];

function generateDiffLines() {
	const lineCount = faker.number.int({ min: 4, max: 12 });
	const lines: { type: "removed" | "added" | "context"; content: string }[] =
		[];

	for (let i = 0; i < lineCount; i++) {
		const roll = faker.number.float({ min: 0, max: 1 });

		if (roll < 0.3) {
			lines.push({
				type: "removed",
				content: faker.helpers.arrayElement(DIFF_REMOVED_LINES),
			});
			lines.push({
				type: "added",
				content: faker.helpers.arrayElement(DIFF_ADDED_LINES),
			});
		} else {
			lines.push({
				type: "context",
				content: faker.helpers.arrayElement(DIFF_CONTEXT_LINES),
			});
		}
	}

	return lines;
}

// ---------------------------------------------------------------------------
// Main seed
// ---------------------------------------------------------------------------

async function seed() {
	console.log("Seeding 100 roasts...\n");

	for (let i = 0; i < 100; i++) {
		const snippet = faker.helpers.arrayElement(CODE_SNIPPETS);
		const lineCount = snippet.code.split("\n").length;
		const score = Number.parseFloat(
			faker.number.float({ min: 1.0, max: 10.0, fractionDigits: 1 }).toFixed(1),
		);
		const roastMode = faker.datatype.boolean({ probability: 0.7 });

		// Pick 2-5 issues per roast
		const issueCount = faker.number.int({ min: 2, max: 5 });
		const issues = faker.helpers
			.arrayElements(ISSUE_TEMPLATES, issueCount)
			.map((tpl, idx) => ({
				severity: tpl.severity as "critical" | "warning" | "good",
				title: tpl.title,
				description: tpl.description,
				order: idx,
			}));

		// ~60% of roasts have diff suggestions
		const hasDiff = faker.datatype.boolean({ probability: 0.6 });
		const diffLines = hasDiff
			? generateDiffLines().map((line, idx) => ({ ...line, order: idx }))
			: [];

		const diffCode = hasDiff ? snippet.code : null;

		// Spread createdAt over the last 30 days
		const createdAt = faker.date.recent({ days: 30 });

		const [roast] = await db
			.insert(roasts)
			.values({
				code: snippet.code,
				language: snippet.language,
				lineCount,
				roastMode,
				score,
				roastQuote: faker.helpers.arrayElement(ROAST_QUOTES),
				diffCode,
				createdAt,
			})
			.returning({ id: roasts.id });

		if (issues.length > 0) {
			await db.insert(roastIssues).values(
				issues.map((issue) => ({
					...issue,
					roastId: roast.id,
				})),
			);
		}

		if (diffLines.length > 0) {
			await db.insert(roastDiffLines).values(
				diffLines.map((line) => ({
					...line,
					roastId: roast.id,
				})),
			);
		}

		const label = `#${String(i + 1).padStart(3, "0")}`;
		console.log(
			`  ${label}  score=${score}\tlang=${snippet.language}\tissues=${issues.length}\tdiff=${diffLines.length} lines`,
		);
	}

	console.log("\nDone! 100 roasts inserted.");
}

seed()
	.catch((err) => {
		console.error("Seed failed:", err);
		process.exit(1);
	})
	.finally(() => {
		client.end();
	});
