from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import json


def create_app():
    app = Flask(__name__)
    CORS(app)
    # SQLite URI
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///app.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    db.init_app(app)

    with app.app_context():
        db.create_all()

    @app.route('/')
    def default_page():
        return 'Welcome to the server!'

    @app.route('/session', methods=['POST'])
    def handle_session():
        data = request.json
        session_id = data.get('sessionId')
        assigned_task = data.get('assignedTask')

        session = UserSession.query.filter_by(session_id=session_id).first()
        if session:
            session.assigned_task = assigned_task
        else:
            new_session = UserSession(session_id=session_id, assigned_task=assigned_task)
            db.session.add(new_session)

        db.session.commit()
        return jsonify({'status': 'success', 'sessionId': session_id, 'assignedTask': assigned_task})

    @app.route('/experiment', methods=['POST'])
    def handle_experiment_data():
        data = request.json
        session_id = data.get('sessionId')
        experiment_number = data.get('experimentNumber')
        selected_profile_index = data.get('selectedProfileIndex')
        chat_history = json.dumps(data.get('chatHistory'))
        user_prediction = data.get('userPrediction')
        chat_iterations = data.get('chatIterations')

        experiment_data = ExperimentData(
            session_id=session_id,
            experiment_number=experiment_number,
            selected_profile_index=selected_profile_index,
            chat_history=chat_history,
            user_prediction=user_prediction,
            chat_iterations=chat_iterations
        )
        db.session.add(experiment_data)
        db.session.commit()

        return jsonify({'status': 'success'})

    return app


db = SQLAlchemy()


class UserSession(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    session_id = db.Column(db.String(120), unique=True, nullable=False)
    assigned_task = db.Column(db.String(120))


class ExperimentData(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    session_id = db.Column(db.String(120), nullable=False)
    experiment_number = db.Column(db.Integer)
    selected_profile_index = db.Column(db.Integer)
    chat_history = db.Column(db.Text)
    user_prediction = db.Column(db.String(120))
    chat_iterations = db.Column(db.Integer)


backend = create_app()

if __name__ == '__main__':
    backend.run(host='0.0.0.0', port=5000)
