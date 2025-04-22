import sys
import json
import lightgbm as lgb
import pandas as pd
import numpy as np
import joblib

# Cargar el modelo general
modelo_general = lgb.Booster(model_file="modelo/modelo_multisalida.txt")

# Cargar los codificadores
label_encoders = joblib.load("modelo/label_encoders.pkl")

# Recibir la entrada como JSON
entrada = json.loads(sys.stdin.read())
entrada_df = pd.DataFrame([entrada])

# Codificar la entrada
for col in ["metrica", "categoria", "posicion", "objetivo"]:
    entrada_df[col] = label_encoders[col].transform(entrada_df[col])

# Predecir
X = entrada_df

# Realizar la predicción para las cuatro salidas (fase, ejercicio, series, repeticiones)
predicciones = modelo_general.predict(X)

# Asumimos que el modelo general devuelve las probabilidades de las cuatro salidas
# Cada salida tendrá un número de clases diferentes, por lo que es importante separar las predicciones

# Obtener las top_n predicciones para cada salida
top_n = 4

# Convertir las predicciones en índices de las clases más probables para cada salida
fase_top = np.argsort(predicciones[:, :len(label_encoders['fase_ejercicio'].classes_)], axis=1)[:, -top_n:]
ejercicio_top = np.argsort(predicciones[:, len(label_encoders['fase_ejercicio'].classes_):len(label_encoders['fase_ejercicio'].classes_) + len(label_encoders['ejercicio_sugerido'].classes_)], axis=1)[:, -top_n:]
series_top = np.argsort(predicciones[:, len(label_encoders['fase_ejercicio'].classes_) + len(label_encoders['ejercicio_sugerido'].classes_):len(label_encoders['fase_ejercicio'].classes_) + len(label_encoders['ejercicio_sugerido'].classes_) + len(label_encoders['series'].classes_)], axis=1)[:, -top_n:]
reps_top = np.argsort(predicciones[:, -len(label_encoders['repeticiones'].classes_):], axis=1)[:, -top_n:]

# Construir la respuesta con las predicciones decodificadas
respuesta = {}
for i in range(len(fase_top)):
    nombre_fase = label_encoders["fase_ejercicio"].inverse_transform([fase_top[i][-1]])[0]
    ejercicios = []
    for j in range(top_n):
        ejercicios.append({
            "nombre": label_encoders["ejercicio_sugerido"].inverse_transform([ejercicio_top[i][-(j+1)]])[0],
            "series": label_encoders["series"].inverse_transform([series_top[i][-(j+1)]])[0],
            "repeticiones": label_encoders["repeticiones"].inverse_transform([reps_top[i][-(j+1)]])[0]
        })
    respuesta[nombre_fase] = {"ejercicios": ejercicios}

# Imprimir la respuesta final en formato JSON
print(json.dumps(respuesta))
