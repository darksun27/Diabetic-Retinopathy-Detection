#!/usr/bin/env python
# coding: utf-8

# In[4]:


from flask import Flask, request, send_file
import base64
import numpy as np
import tensorflow
import keras
from keras.preprocessing import image
from keras.models import load_model
from flask_ngrok import run_with_ngrok
from PIL import ImageTk, Image
import fpdf
from datetime import date
import tensorflow as tf


# In[5]:


def fetch_results(image_str,patient_name):
  with tf.name_scope("predict"):
    loaded_graph = tf.Graph()
    with tf.Session(graph=loaded_graph) as sess:
      with open("{}.jpeg".format(patient_name) , "wb") as image_file_recv:
        image_file_recv.write(base64.b64decode(image_str.encode('utf-8')))
      model = tensorflow.keras.models.load_model("/content/keras_model.h5")
      testing_image = image.load_img("/content/{}.jpeg".format(patient_name),target_size = (224, 224))
      testing_image = image.img_to_array(testing_image)
      testing_image = np.expand_dims(testing_image, axis = 0)

      pdf = fpdf.FPDF(format ='letter')
      pdf.add_page()
      pdf.set_fill_color(230,230,0)
      pdf.image("/content/Banner.png",0,0,215,50,'PNG')
      pdf.set_font("Arial", size = 12)
      pdf.ln(50)
      pdf.set_font("Arial","B", size = 12)
      pdf.multi_cell(0, 10, txt="{}".format(date.today()), border=0, align="R",fill=False)
      pdf.multi_cell(0, 10, txt="{}".format(patient_name.upper()), border=0, align="L",fill=False)
      pdf.set_font("Arial", size = 12)
      pdf.ln(90)
      pdf.set_font("Arial","B", size = 9)
      pdf.image("/content/{}.jpeg".format(patient_name),75,90,75,75,'JPEG')
      pdf.multi_cell(200, 3, txt="Patient's Retina Picture", border=0, align="C",fill=False)
      pdf.ln(10)

      pred = model.predict(testing_image)

      is_cancer = False
      prob = 0.0

      if pred[0][0] > pred[0][1]:
        is_cancer = True
        prob = pred[0][0]*100
        pdf.set_font("Arial","B", size = 12)
        pdf.multi_cell(200, 10, txt="Findings in diagnosis:", border=0, align="L",fill=False)
        pdf.set_font("Arial", size = 12)
        pdf.multi_cell(200, 10, txt="Cancer cells were found during the diagnosis. This findings lead to the conclusion that diabetic retinopathy disease is present.", border=0, align="L",fill=True)
      else:
        prob = pred[0][1]*100
        pdf.multi_cell(200, 10, txt="No presence of Cancerous Cells was found. If the problem still persists you please consult a doctor.", border=0, align="L",fill=True)

      pdf.ln(20)
      pdf.set_font("Arial","B", size = 12)
      pdf.multi_cell(0, 10, txt="****This is a computer generated report. This report is only to guide for further investigation, no action should be taken based on this report.****", border=0, align="C",fill=False)
      pdf.output("/content/{}.pdf".format(patient_name))

      return {"is_cancer" : is_cancer, "prob" : prob}


# In[6]:


app = Flask(__name__)

# run_with_ngrok(app)

@app.route("/detect" , methods = ['POST'])
def detect():
  try:
    if request.method == 'POST':
      return fetch_results(request.form.get('image_str'),request.form.get('patient_name'))
  except:
    return "ERROR OCCURED", 500

@app.route("/getReport", methods = ['GET'])
def getReport():
  try:
    if request.method == 'GET':
      return send_file("/content/{}.pdf".format(request.args.get('patient_name')), attachment_filename = "{}_DR_Report.pdf".format(request.args.get('patient_name')))
  except:
    return "ERROR", 500


# In[7]:


app.run()


# In[ ]:




