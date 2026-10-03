import torch
import torch.nn as nn
import torch.nn.functional as F

class ISLTemporalAttention(nn.Module):
    """
    Temporal Self-Attention mechanism over landmark sequence frames.
    Captures temporal movement dynamics, trajectories, and key hold frames.
    """
    def __init__(self, hidden_dim: int):
        super().__init__()
        self.query = nn.Linear(hidden_dim, hidden_dim)
        self.key = nn.Linear(hidden_dim, hidden_dim)
        self.value = nn.Linear(hidden_dim, hidden_dim)
        self.scale = (hidden_dim) ** 0.5

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        # x: (batch_size, seq_len, hidden_dim)
        Q = self.query(x)
        K = self.key(x)
        V = self.value(x)
        
        scores = torch.matmul(Q, K.transpose(-2, -1)) / self.scale
        attn_weights = F.softmax(scores, dim=-1)
        context = torch.matmul(attn_weights, V)
        return context


class ISLTemporalBiLSTM(nn.Module):
    """
    Deep Bidirectional LSTM with Temporal Attention for Continuous Indian Sign Language (ISL) Recognition.
    Takes normalized 30-frame landmark sequences of shape (Batch, 30, 126).
    """
    def __init__(self, input_dim: int = 126, hidden_dim: int = 128, num_layers: int = 2, num_classes: int = 200, dropout: float = 0.3):
        super().__init__()
        self.input_dim = input_dim
        self.hidden_dim = hidden_dim
        self.num_layers = num_layers
        self.num_classes = num_classes

        # Spatial Feature Projector
        self.input_proj = nn.Sequential(
            nn.Linear(input_dim, hidden_dim),
            nn.LayerNorm(hidden_dim),
            nn.ReLU(),
            nn.Dropout(dropout)
        )

        # Bi-directional LSTM
        self.lstm = nn.LSTM(
            input_size=hidden_dim,
            hidden_size=hidden_dim,
            num_layers=num_layers,
            batch_first=True,
            bidirectional=True,
            dropout=dropout if num_layers > 1 else 0.0
        )

        # Temporal Attention
        self.attention = ISLTemporalAttention(hidden_dim * 2)

        # Classification Head
        self.classifier = nn.Sequential(
            nn.Linear(hidden_dim * 2, hidden_dim),
            nn.LayerNorm(hidden_dim),
            nn.ReLU(),
            nn.Dropout(dropout),
            nn.Linear(hidden_dim, num_classes)
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        # x: (batch_size, seq_len, input_dim)
        batch_size, seq_len, _ = x.shape
        proj = self.input_proj(x)
        lstm_out, _ = self.lstm(proj)  # (batch_size, seq_len, hidden_dim * 2)
        attn_out = self.attention(lstm_out)
        
        # Global temporal pooling with weighted context
        pooled = torch.mean(attn_out, dim=1)  # (batch_size, hidden_dim * 2)
        logits = self.classifier(pooled)      # (batch_size, num_classes)
        return logits

    def predict_top_k(self, x: torch.Tensor, k: int = 5):
        """
        Returns top-k predicted class indices and calibrated softmax probabilities.
        """
        self.eval()
        with torch.no_grad():
            logits = self.forward(x)
            probs = F.softmax(logits, dim=-1)
            top_probs, top_indices = torch.topk(probs, k=min(k, self.num_classes), dim=-1)
            return top_probs.cpu().numpy(), top_indices.cpu().numpy()
