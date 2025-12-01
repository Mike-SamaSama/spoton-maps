const { CloudTasksClient } = require('@google-cloud/tasks');

let tasksClient;

/**
 * Get Cloud Tasks client
 */
function getTasksClient() {
  if (!tasksClient) {
    tasksClient = new CloudTasksClient();
  }
  return tasksClient;
}

/**
 * Create an HTTP task in Cloud Tasks queue
 * @param {string} relativeUrl - Relative URL (e.g., /refresh)
 * @param {object} payload - Request body
 * @returns {Promise<string>} Task name
 */
async function createHttpTask(relativeUrl, payload) {
  const client = getTasksClient();

  const project = process.env.GCP_PROJECT;
  const queue = process.env.CLOUD_TASKS_QUEUE || 'token-refresh-queue';
  const location = process.env.CLOUD_TASKS_LOCATION || 'us-central1';
  const baseUrl = process.env.WORKER_BASE_URL;

  const parent = client.queuePath(project, location, queue);

  const task = {
    httpRequest: {
      httpMethod: 'POST',
      url: `${baseUrl}${relativeUrl}`,
      headers: {
        'Content-Type': 'application/json'
      },
      body: Buffer.from(JSON.stringify(payload)).toString('base64'),
      oidcToken: {
        serviceAccountEmail: process.env.GCP_SERVICE_ACCOUNT_EMAIL
      }
    }
  };

  const [response] = await client.createTask({ parent, task });
  console.log(`✅ Task created: ${response.name}`);
  return response.name;
}

module.exports = {
  createHttpTask
};
