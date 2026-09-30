"""Machine Learning Anomaly Detector using Isolation Forest."""
from __future__ import annotations

import numpy as np
from sklearn.ensemble import IsolationForest


class IsolationForestAnomalyDetector:
    """Isolation Forest behavioral anomaly scoring model for network flows."""

    def __init__(self, contamination: float = 0.1) -> None:
        self.model = IsolationForest(
            n_estimators=100,
            contamination=contamination,
            random_state=42,
        )
        # Pre-fit on synthetic baseline normal network traffic
        baseline_samples = self._generate_baseline_normal_samples()
        self.model.fit(baseline_samples)

    def _generate_baseline_normal_samples(self) -> np.ndarray:
        """Generate baseline normal network traffic feature vectors for initial calibration."""
        np.random.seed(42)
        # Features: [conn_count, bytes_in, bytes_out, unique_dsts, unique_ports, dns_freq, failed_conns, port_entropy]
        conn_count = np.random.uniform(5, 50, 200)
        bytes_in = np.random.uniform(1000, 50000, 200)
        bytes_out = np.random.uniform(500, 20000, 200)
        unique_dsts = np.random.uniform(1, 5, 200)
        unique_ports = np.random.uniform(1, 4, 200)
        dns_freq = np.random.uniform(2, 20, 200)
        failed_conns = np.random.uniform(0, 2, 200)
        port_entropy = np.random.uniform(0.1, 1.5, 200)

        return np.column_stack([
            conn_count, bytes_in, bytes_out, unique_dsts, unique_ports, dns_freq, failed_conns, port_entropy
        ])

    def predict_anomaly_score(self, feature_dict: dict[str, float]) -> float:
        """Compute normalized anomaly score [0.0 to 1.0].

        0.0 = completely normal baseline behavior
        1.0 = highly anomalous behavioral outlier
        """
        vec = np.array([
            feature_dict.get("connection_count", 0.0),
            feature_dict.get("bytes_in", 0.0),
            feature_dict.get("bytes_out", 0.0),
            feature_dict.get("unique_destinations", 0.0),
            feature_dict.get("unique_ports", 0.0),
            feature_dict.get("dns_frequency", 0.0),
            feature_dict.get("failed_connections", 0.0),
            feature_dict.get("port_entropy", 0.0),
        ]).reshape(1, -1)

        # decision_function returns negative values for anomalies, positive for normal
        raw_score = float(self.model.decision_function(vec)[0])
        # Transform decision function to 0.0 - 1.0 range
        anomaly_score = max(0.0, min(1.0, 0.5 - (raw_score * 2.5)))
        return round(float(anomaly_score), 2)


anomaly_detector = IsolationForestAnomalyDetector()
