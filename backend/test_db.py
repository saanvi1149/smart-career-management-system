import pymysql

try:
    conn = pymysql.connect(
        host="127.0.0.1",
        port=3308,
        user="root",
        password="$4saanvi",
        database="scms_db"
    )
    print("Connection successful!")
    conn.close()
except Exception as e:
    print("Connection failed:", e)