from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from datetime import datetime

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

    @app.route('/consent', methods=['POST'])
    def handle_consent():
        data = request.json
        session_id = data.get('sessionId')
        new_session = UserSession(session_id=session_id)
        db.session.add(new_session)
        db.session.commit()
        return jsonify({'status': 'success', 'sessionId': session_id})

    return app


db = SQLAlchemy()


class UserSession(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    session_id = db.Column(db.String(120), unique=True, nullable=False)
    consent_given_at = db.Column(db.DateTime, default=datetime.utcnow)


app = create_app()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
