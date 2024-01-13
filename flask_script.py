from flask import Flask, render_template, request, redirect, url_for
import os
from datetime import datetime, timedelta

app = Flask(__name__)

def get_video_files():
    video_dir = './static/movie_link'  # シンボリックリンクのパス
    video_files = sorted(os.listdir(video_dir), reverse=True)
    return video_files

@app.route('/', methods=['GET', 'POST'])
def index():
    date_requested = request.args.get('date')
    video_files = get_video_files()
    print(f"date: {date_requested}")

    if date_requested:
        # YYYY-MM-DD 形式を YYYYMMDD に変換
        if '-' in date_requested:
            try:
                date_requested = datetime.strptime(date_requested, '%Y-%m-%d').strftime('%Y%m%d')
                print(f"conv: {date_requested}")
            except ValueError:
                print("無効な日付形式です。")
                return "無効な日付形式です。", 400
        else:
            try:
                # 既に YYYYMMDD 形式であることを確認
                datetime.strptime(date_requested, '%Y%m%d')
            except ValueError:
                print("無効な日付形式です。")
                return "無効な日付形式です。", 400

    if not date_requested and video_files:
        # 最新の動画から日付部分を取得
        latest_video = video_files[0]
        date_requested = latest_video.split('_')[1].split('.')[0]

    # 特定の日付の動画を取得
    video_files = [v for v in video_files if date_requested in v]
    latest_video = video_files[0] if video_files else None

    # 日付ナビゲーション用
    current_date = datetime.strptime(date_requested, '%Y%m%d')
    prev_date = current_date - timedelta(days=1)
    next_date = current_date + timedelta(days=1)

    return render_template('index.html', latest_video=latest_video,
                           current_date=current_date, prev_date=prev_date,
                           next_date=next_date)



if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
