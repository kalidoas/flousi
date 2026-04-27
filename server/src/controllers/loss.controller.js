import {
  createLossForUser,
  deleteLossForUser,
  getLossesByUserId,
  updateLossForUser
} from "../services/loss.service.js";

const mapLossEntry = (entry) => ({
  ...entry,
  amount: Number(entry.amount)
});

export const getLosses = async (req, res) => {
  const { period = "all" } = req.validated.query;
  const losses = await getLossesByUserId(req.auth.userId, period);

  return res.status(200).json({
    period,
    count: losses.length,
    losses: losses.map(mapLossEntry)
  });
};

export const createLoss = async (req, res) => {
  const loss = await createLossForUser(req.auth.userId, req.validated.body);

  return res.status(201).json({
    message: "Loss entry created",
    loss: mapLossEntry(loss)
  });
};

export const updateLoss = async (req, res) => {
  const loss = await updateLossForUser(req.auth.userId, req.validated.params.id, req.validated.body);

  return res.status(200).json({
    message: "Loss entry updated",
    loss: mapLossEntry(loss)
  });
};

export const deleteLoss = async (req, res) => {
  await deleteLossForUser(req.auth.userId, req.validated.params.id);

  return res.status(200).json({
    message: "Loss entry deleted"
  });
};

