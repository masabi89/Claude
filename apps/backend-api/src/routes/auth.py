from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from src.models.user import db, User
import jwt
import datetime
import os

auth_bp = Blueprint('auth', __name__)

SECRET_KEY = os.environ.get('SECRET_KEY', 'your-secret-key-here')

@auth_bp.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['name', 'email', 'password', 'tenantName', 'tenantSlug']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'message': f'{field} is required'}), 400
        
        # Check if user already exists
        existing_user = User.query.filter_by(email=data['email']).first()
        if existing_user:
            return jsonify({'message': 'User already exists'}), 400
        
        # Create new user
        hashed_password = generate_password_hash(data['password'])
        new_user = User(
            name=data['name'],
            email=data['email'],
            password=hashed_password,
            tenant_name=data['tenantName'],
            tenant_slug=data['tenantSlug'],
            role='ORG_ADMIN'
        )
        
        db.session.add(new_user)
        db.session.commit()
        
        # Generate tokens
        access_token = jwt.encode({
            'user_id': new_user.id,
            'email': new_user.email,
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
        }, SECRET_KEY, algorithm='HS256')
        
        refresh_token = jwt.encode({
            'user_id': new_user.id,
            'exp': datetime.datetime.utcnow() + datetime.timedelta(days=30)
        }, SECRET_KEY, algorithm='HS256')
        
        return jsonify({
            'message': 'User created successfully',
            'accessToken': access_token,
            'refreshToken': refresh_token,
            'user': {
                'id': new_user.id,
                'name': new_user.name,
                'email': new_user.email,
                'role': new_user.role,
                'tenantName': new_user.tenant_name,
                'tenantSlug': new_user.tenant_slug
            }
        }), 201
        
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        
        if not data.get('email') or not data.get('password'):
            return jsonify({'message': 'Email and password are required'}), 400
        
        user = User.query.filter_by(email=data['email']).first()
        
        if not user or not check_password_hash(user.password, data['password']):
            return jsonify({'message': 'Invalid credentials'}), 401
        
        # Generate tokens
        access_token = jwt.encode({
            'user_id': user.id,
            'email': user.email,
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
        }, SECRET_KEY, algorithm='HS256')
        
        refresh_token = jwt.encode({
            'user_id': user.id,
            'exp': datetime.datetime.utcnow() + datetime.timedelta(days=30)
        }, SECRET_KEY, algorithm='HS256')
        
        return jsonify({
            'message': 'Login successful',
            'accessToken': access_token,
            'refreshToken': refresh_token,
            'user': {
                'id': user.id,
                'name': user.name,
                'email': user.email,
                'role': user.role,
                'tenantName': user.tenant_name,
                'tenantSlug': user.tenant_slug
            }
        }), 200
        
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@auth_bp.route('/me', methods=['GET'])
def get_profile():
    try:
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'message': 'No token provided'}), 401
        
        # Remove 'Bearer ' prefix
        token = token.replace('Bearer ', '')
        
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
            user = User.query.get(payload['user_id'])
            
            if not user:
                return jsonify({'message': 'User not found'}), 404
            
            return jsonify({
                'id': user.id,
                'name': user.name,
                'email': user.email,
                'role': user.role,
                'tenantName': user.tenant_name,
                'tenantSlug': user.tenant_slug
            }), 200
            
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Invalid token'}), 401
            
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@auth_bp.route('/refresh', methods=['POST'])
def refresh_token():
    try:
        data = request.get_json()
        refresh_token = data.get('refreshToken')
        
        if not refresh_token:
            return jsonify({'message': 'Refresh token required'}), 400
        
        try:
            payload = jwt.decode(refresh_token, SECRET_KEY, algorithms=['HS256'])
            user = User.query.get(payload['user_id'])
            
            if not user:
                return jsonify({'message': 'User not found'}), 404
            
            # Generate new access token
            access_token = jwt.encode({
                'user_id': user.id,
                'email': user.email,
                'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
            }, SECRET_KEY, algorithm='HS256')
            
            return jsonify({
                'accessToken': access_token
            }), 200
            
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Refresh token expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Invalid refresh token'}), 401
            
    except Exception as e:
        return jsonify({'message': str(e)}), 500

