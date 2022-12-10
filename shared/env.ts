import { existsSync } from "fs";

const checkEnvVar = (name: string) => {
  const envVar = process.env[name];

  if (!envVar) {
    console.error(`${name} must be a defined env var`);
    process.exit(1);
  }

  return envVar;
};

const checkEnvVarFile = (name: string) => {
  const envVar = checkEnvVar(name);

  if (!existsSync(envVar)) {
    console.error(`${name} must exist: ${envVar}`);
    process.exit(1);
  }

  return envVar;
};

export { checkEnvVar, checkEnvVarFile };
