import joblib
import os
import pandas as pd

base = r'C:\Users\vparr\OneDrive\Desktop\Importants files\python\finguard\backend-python\app\models'
print('files', os.listdir(base))
clf = joblib.load(os.path.join(base, 'anomaly_detector.pkl'))
for x in [10, 50, 100, 500, 1000, 10000]:
    p = clf.predict([[x]])[0]
    s = clf.decision_function([[x]])[0]
    print('value', x, 'predict', p, 'score', s)

csv_path = r'C:\Users\vparr\OneDrive\Desktop\Importants files\python\finguard\backend-python\training\data_sintetica.csv'
if os.path.exists(csv_path):
    df = pd.read_csv(csv_path)
    print('csv shape', df.shape)
    print('monto stats', df['monto'].describe().to_dict())
    preds = clf.predict(df[['monto']])
    print('anomaly rate on csv:', float((preds == -1).mean()))
    print('example anomaly montos', df.loc[preds == -1, 'monto'].head(10).tolist())
else:
    print('CSV no encontrado:', csv_path)
