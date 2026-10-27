from application import app, application

if __name__ == '__main__':
    from wsgiref.simple_server import make_server
    import os
    port = int(os.environ.get('PORT', 8000))
    server = make_server('0.0.0.0', port, app)
    print(f"Running on port {port}")
    server.serve_forever()
