from dotenv import load_dotenv
load_dotenv()

from flask import Flask, request, jsonify, Response
from flask_cors import CORS, cross_origin
import requests
import os

app = Flask(__name__)
CORS(app)

MESHY_API_KEY = os.getenv("MESHY_API_KEY")
API_BASE = "https://api.meshy.ai/openapi/v2/text-to-3d"

task_store = {}

@app.route('/api/generate', methods=['POST'])
@cross_origin()
def generate_preview():
    data = request.get_json() or {}
    prompt = data.get('prompt','').strip()
    print(f"[generate_preview] prompt received: {repr(prompt)}")
    if not prompt:
        return jsonify({'error':'Prompt is required'}), 400

    payload = {
        'mode':'preview',
        'prompt':prompt,
        'art_style': data.get('art_style','realistic'),
        'should_remesh': True,
        'ai_model':'meshy-5'
    }
    if data.get('negative_prompt'):
        payload['negative_prompt'] = data['negative_prompt']

    resp = requests.post(API_BASE, json=payload, headers={
        'Authorization': f'Bearer {MESHY_API_KEY}',
        'Content-Type': 'application/json'
    })
    resp.raise_for_status()

    task_id = resp.json().get('result')
    if not task_id:
        return jsonify({'error':'No task ID returned','details':resp.json()}), 502

    task_store[task_id] = {'mode':'preview'}
    return jsonify({'task_id':task_id,'status':'PENDING'}), 200

@app.route('/api/status/<task_id>', methods=['GET'])
@cross_origin()
def get_status(task_id):
    """Check status of preview or refine."""
    if task_id not in task_store:
        return jsonify({'error':'Unknown task_id'}), 404

    resp = requests.get(f"{API_BASE}/{task_id}", headers={
        'Authorization': f'Bearer {MESHY_API_KEY}',
        'Content-Type': 'application/json'
    })
    resp.raise_for_status()
    data = resp.json()
    status = data.get('status')
    mode   = task_store[task_id]['mode']

    if mode=='preview' and status=='SUCCEEDED':
        return jsonify({
            'task_id': task_id,
            'status':'PREVIEW_READY',
            'preview_model_url': data['model_urls'].get('glb')
        }), 200

    if mode=='refine' and status=='SUCCEEDED':
        return jsonify({
            'task_id': task_id,
            'status':'COMPLETED',
            'model_urls': data.get('model_urls',{})
        }), 200

    if status=='FAILED':
        return jsonify({
            'task_id': task_id,
            'status':'FAILED',
            'error': data.get('task_error',{}).get('message')
        }), 200

    return jsonify({
        'task_id': task_id,
        'status': status,
        'progress': data.get('progress',0)
    }), 200

@app.route('/api/refine', methods=['POST'])
@cross_origin()
def generate_refine():
    try:
        data = request.get_json() or {}
        preview_id = data.get('preview_task_id')
        if not preview_id:
            return jsonify({'error':'preview_task_id is required'}), 400

        payload = {
            'mode':'refine',
            'preview_task_id': preview_id,
            'ai_model':'meshy-5'
        }
        if data.get('negative_prompt'):
            payload['negative_prompt'] = data['negative_prompt']

        resp = requests.post(API_BASE, json=payload, headers={
            'Authorization': f'Bearer {MESHY_API_KEY}',
            'Content-Type': 'application/json'
        })
        resp.raise_for_status()

        refine_id = resp.json().get('result')
        if not refine_id:
            return jsonify({'error':'No refine ID returned','details':resp.json()}), 502

        task_store[refine_id] = {'mode':'refine'}
        return jsonify({'task_id':refine_id,'status':'PENDING'}), 200

    except Exception as e:
        return jsonify({'details':str(e)}), 500

@app.route('/api/proxy-glb', methods=['GET'])
@cross_origin()
def proxy_glb():
    url = request.args.get('url')
    if not url:
        return jsonify({'error':'url query param required'}), 400

    resp = requests.get(url, stream=True)
    resp.raise_for_status()
    return Response(resp.content , mimetype=resp.headers.get('Content-Type','model/gltf-binary'))

if __name__=='__main__':
    app.run(debug=True, port=int(os.getenv('PORT',5000)))
