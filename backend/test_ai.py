from ai_service import generate_portfolio_from_prompt
import json

result = generate_portfolio_from_prompt(
    "I'm a CS student who built a FastAPI user management app with JWT auth, "
    "and a Flask digital wallet app. I'm interested in backend development."
)
print(json.dumps(result, indent=2))