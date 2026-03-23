import torch

def generate_sec(probs, idx_to_class, top_k=3):
    """
    Structured Explanation Card (SEC)
    """

    top_probs, top_idxs = torch.topk(probs, top_k)

    top_probs = top_probs.squeeze().cpu().numpy()
    top_idxs = top_idxs.squeeze().cpu().numpy()

    top_predictions = []

    for i in range(top_k):
        top_predictions.append({
            "class": idx_to_class[int(top_idxs[i])],
            "confidence": float(top_probs[i])
        })

    predicted_class = top_predictions[0]["class"]
    confidence = top_predictions[0]["confidence"]

    return {
        "predicted_class": predicted_class,
        "confidence": confidence,
        "top_predictions": top_predictions
    }