const clients = new Map(); // email → res

const addClient = (email, res) => clients.set(email, res);
const removeClient = (email) => clients.delete(email);
const notifyClient = (email, data) => {
  const res = clients.get(email);
  if (res) {
    res.write(`data: ${JSON.stringify(data)}\n\n`);

    if (data.status === "verified") {
      res.end();
      removeClient(email);
    }
  }
};

module.exports = { addClient, removeClient, notifyClient };
