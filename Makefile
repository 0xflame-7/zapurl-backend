# Makefile

.PHONY: test run

# Runs unit & integration tests in a temporary container
test:
	docker compose run --rm auth-service pnpm test

# Starts the app in watch mode (Syncs code changes automatically)
run:
	docker compose up --watch