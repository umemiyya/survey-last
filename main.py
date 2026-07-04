import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
)
from sklearn.preprocessing import LabelEncoder
import pickle
import warnings

warnings.filterwarnings("ignore")


np.random.seed(42)

def generate_data(n_per_class=100):
    """
    Generate data sintetis yang menyerupai pola survey kepuasan:
    - Sangat Puas: rating cenderung tinggi (4-5)
    - Puas: rating cenderung sedang (3-4)
    - Tidak Puas: rating cenderung rendah (1-2)
    """
    features = []
    labels = []

    feature_names = [
        "pelayananService",
        "kecepatanRespon",
        "kualitasAroma",
        "kualitasPengharum",
        "ketepatanWaktu",
        "kebersihanAlat",
        "pelayananComplain",
    ]

    class_configs = [
        ("Sangat Puas", 4.3, 0.7),
        ("Puas",        3.0, 0.8),
        ("Tidak Puas",  1.7, 0.7),
    ]

    for label, mean, std in class_configs:
        for _ in range(n_per_class):
            row = np.clip(
                np.round(np.random.normal(mean, std, len(feature_names))),
                1, 5
            ).astype(int)
            features.append(row)
            labels.append(label)

    df = pd.DataFrame(features, columns=feature_names)
    df["label"] = labels

    # Acak urutan baris
    return df.sample(frac=1, random_state=42).reset_index(drop=True)


df = generate_data(n_per_class=100)

print("=" * 60)
print("DATA SUMMARY")
print("=" * 60)
print(f"Total data: {len(df)} baris")
print(f"Distribusi label:\n{df['label'].value_counts()}\n")
print(f"5 baris pertama:\n{df.head()}\n")


FEATURE_COLS = [
    "pelayananService",
    "kecepatanRespon",
    "kualitasAroma",
    "kualitasPengharum",
    "ketepatanWaktu",
    "kebersihanAlat",
    "pelayananComplain",
]

X = df[FEATURE_COLS].values
y = df["label"].values

# Encode label string ke integer
# Tidak Puas → 0, Puas → 1, Sangat Puas → 2
label_encoder = LabelEncoder()
y_encoded = label_encoder.fit_transform(y)

print("Mapping label → integer:")
for i, cls in enumerate(label_encoder.classes_):
    print(f"  {cls} → {i}")
print()


X_train, X_test, y_train, y_test = train_test_split(
    X, y_encoded,
    test_size=0.2,        
    random_state=42,
    stratify=y_encoded,   
)

print(f"Ukuran data train : {len(X_train)} baris")
print(f"Ukuran data test  : {len(X_test)} baris\n")


model = RandomForestClassifier(
    n_estimators=100,      
    max_depth=None,       
    min_samples_split=2,   
    min_samples_leaf=1,   
    max_features="sqrt",   
    random_state=42,
    n_jobs=-1,            
)

model.fit(X_train, y_train)

print("Model berhasil dilatih.\n")


# =============================================================================
# 5. EVALUASI MODEL
# =============================================================================

y_pred = model.predict(X_test)

accuracy = accuracy_score(y_test, y_pred)

print("=" * 60)
print("HASIL EVALUASI")
print("=" * 60)
print(f"Accuracy : {accuracy * 100:.2f}%\n")

print("Classification Report:")
print(
    classification_report(
        y_test, y_pred,
        target_names=label_encoder.classes_
    )
)

print("Confusion Matrix:")
cm = confusion_matrix(y_test, y_pred)
cm_df = pd.DataFrame(
    cm,
    index=[f"Aktual: {c}" for c in label_encoder.classes_],
    columns=[f"Prediksi: {c}" for c in label_encoder.classes_],
)
print(cm_df)
print()


# =============================================================================
# 6. CROSS VALIDATION (Opsional, untuk validasi lebih robust)
# =============================================================================

cv_scores = cross_val_score(model, X, y_encoded, cv=5, scoring="accuracy")

print("=" * 60)
print("CROSS VALIDATION (5-fold)")
print("=" * 60)
print(f"Skor tiap fold : {[f'{s:.2f}' for s in cv_scores]}")
print(f"Rata-rata      : {cv_scores.mean() * 100:.2f}%")
print(f"Std deviasi    : {cv_scores.std() * 100:.2f}%\n")


# =============================================================================
# 7. FEATURE IMPORTANCE
# =============================================================================

print("=" * 60)
print("FEATURE IMPORTANCE (urutan paling berpengaruh)")
print("=" * 60)

importances = model.feature_importances_
importance_df = (
    pd.DataFrame({
        "Fitur": FEATURE_COLS,
        "Importance": importances,
        "Persentase": importances * 100,
    })
    .sort_values("Importance", ascending=False)
    .reset_index(drop=True)
)

for _, row in importance_df.iterrows():
    bar = "█" * int(row["Persentase"] / 2)
    print(f"  {row['Fitur']:<25} {row['Persentase']:5.1f}%  {bar}")
print()


# =============================================================================
# 8. SIMPAN MODEL
# =============================================================================

model_data = {
    "model": model,
    "label_encoder": label_encoder,
    "feature_cols": FEATURE_COLS,
}

with open("model_kepuasan.pkl", "wb") as f:
    pickle.dump(model_data, f)

print("Model tersimpan di: model_kepuasan.pkl\n")


# =============================================================================
# 9. CONTOH PREDIKSI (setelah model disimpan)
# =============================================================================

print("=" * 60)
print("CONTOH PREDIKSI")
print("=" * 60)

# Load model dari file
with open("model_kepuasan.pkl", "rb") as f:
    saved = pickle.load(f)

loaded_model   = saved["model"]
loaded_encoder = saved["label_encoder"]

# Contoh input baru (rating 1-5 untuk 7 fitur)
contoh_input = [
    # pelSvc  respon  aroma  pengharum  waktu  kebersihan  complain
    [5,       5,      4,     4,         5,      4,          5],   # ekspektasi: Sangat Puas
    [3,       3,      3,     2,         3,      3,          3],   # ekspektasi: Puas
    [1,       2,      1,     1,         2,      1,          1],   # ekspektasi: Tidak Puas
]

prediksi_encoded = loaded_model.predict(contoh_input)
prediksi_label   = loaded_encoder.inverse_transform(prediksi_encoded)
probabilitas     = loaded_model.predict_proba(contoh_input)

for i, (label, proba) in enumerate(zip(prediksi_label, probabilitas)):
    confidence = max(proba) * 100
    print(f"  Input {i+1}: {contoh_input[i]}")
    print(f"  → Prediksi : {label}  ({confidence:.1f}% confidence)\n")