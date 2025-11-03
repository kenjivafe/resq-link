# Terraform Infrastructure Scaffold

This directory hosts Terraform modules used to provision ResQ Link environments.

## Suggested Layout

- `main.tf` – Root module orchestration
- `providers.tf` – Cloud provider configuration
- `variables.tf` – Shared inputs
- `outputs.tf` – Key exported values
- `modules/` – Feature-specific submodules (database, cache, storage, networking)

## Next Steps

1. Define remote state backend (e.g., Terraform Cloud, S3 + DynamoDB).
2. Add workspace-specific variable files in `env/` (e.g., `env/staging.tfvars`).
3. Integrate `terraform` targets into CI/CD once modules are defined.
