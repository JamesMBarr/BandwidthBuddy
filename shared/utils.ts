import fetch from "node-fetch";

interface EmptyFunction {
  (): Promise<any>;
}

const wait = (delay: number) => {
  return new Promise((res) => {
    setTimeout(res, delay);
  });
};

const backoff = async (
  callback: EmptyFunction,
  delay: number,
  retries: number = 5
): Promise<any> => {
  console.log({ callback, delay, retries });
  try {
    await wait(delay);
    return await callback();
  } catch (error) {
    console.error(error);

    if (retries > 1) {
      return await backoff(callback, delay * 2, retries - 1);
    } else {
      throw new Error(`Max number of retries exceeded: ${error}`);
    }
  }
};

const fetchWrapper = async (
  ...args: Parameters<typeof fetch>
): ReturnType<typeof fetch> => {
  return new Promise(async (res, rej) => {
    try {
      const resp = await fetch(args[0], args[1]);

      if (!resp.ok) rej(resp.text());

      res(resp);
    } catch (error) {
      rej(error);
    }
  });
};

export { wait, backoff, fetchWrapper };
