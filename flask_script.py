from flask import Flask, render_template, request, redirect, url_for
from glob import glob
import pandas as pd
from datetime import datetime, timedelta
import os

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

    try:
        end_date = datetime.strptime(date_requested, '%Y%m%d')
    except ValueError:
        print("無効なend dateです。")
        return "無効なend dateです。", 400
    # 8日間の期間を設定
    start_date = end_date - timedelta(days=7)

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

def read_daily_csv(start_date, end_date):
    # 日付範囲内のファイルパスを生成
    date_range = pd.date_range(start=start_date, end=end_date)
    file_paths = [f'./static/csv_link/{date.strftime("%Y%m%d")}.csv' for date in date_range]

    # 各ファイルを読み込み、1つのDataFrameに結合
    daily_dfs = []
    for file_path in file_paths:
        try:
            df = pd.read_csv(file_path)
            df['date'] = pd.to_datetime(file_path.split('/')[-1].split('.')[0], format='%Y%m%d')
            daily_dfs.append(df)
        except FileNotFoundError:
            print(f"ファイル {file_path} が見つかりません。")

    if not daily_dfs:
        return pd.DataFrame()  # 空のDataFrameを返す

    return pd.concat(daily_dfs, ignore_index=True)

def aggregate_daily_data(df):
    # 日付ごとに集計
    aggregated_data = df.groupby('date').sum()
    print(f"sum: {aggregated_data}")
    return aggregated_data

@app.route('/daily_data', methods=['GET'])
def daily_data():
    start_date = request.args.get('start_date', type=str)
    end_date = request.args.get('end_date', type=str)

    try:
        start_date = datetime.strptime(start_date, '%Y%m%d')
        end_date = datetime.strptime(end_date, '%Y%m%d')
    except ValueError:
        print(f"error date s{start_date}, e{end_date}")
        return "日付形式が無効です。YYYYMMDD形式で指定してください。", 400

    df = read_daily_csv(start_date, end_date)
    aggregated_data = aggregate_daily_data(df)
    return aggregated_data.to_json(orient='table')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
