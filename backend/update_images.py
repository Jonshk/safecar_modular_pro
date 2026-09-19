import sqlite3

conn = sqlite3.connect('safecar.db')
c = conn.cursor()

updates = [
    (1,  'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=800&q=80&fit=crop'),
    (2,  'https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?w=800&q=80&fit=crop'),
    (3,  'https://images.unsplash.com/photo-1504222490345-c075b7b1abc0?w=800&q=80&fit=crop'),
    (4,  'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800&q=80&fit=crop'),
    (5,  'https://images.unsplash.com/photo-1530046339160-ce3e530c7d2f?w=800&q=80&fit=crop'),
    (6,  'https://images.unsplash.com/photo-1489824904134-891ab64532f1?w=800&q=80&fit=crop'),
    (7,  'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80&fit=crop'),
    (8,  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80&fit=crop'),
    (9,  'https://images.unsplash.com/photo-1562911791-c7a97b729ec5?w=800&q=80&fit=crop'),
    (10, 'https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?w=800&q=80&fit=crop'),
    (11, 'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?w=800&q=80&fit=crop'),
    (12, 'https://images.unsplash.com/photo-1486006920555-c77dcf18193c?w=800&q=80&fit=crop'),
    (13, 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=800&q=80&fit=crop'),
    (14, 'https://images.unsplash.com/photo-1612825173281-9a193378527e?w=800&q=80&fit=crop'),
    (15, 'https://images.unsplash.com/photo-1609152712027-76a5a7e8ce27?w=800&q=80&fit=crop'),
    (16, 'https://images.unsplash.com/photo-1559416523-140ddc3d238c?w=800&q=80&fit=crop'),
    (17, 'https://images.unsplash.com/photo-1614026480418-bd11fdb9a4ef?w=800&q=80&fit=crop'),
    (18, 'https://images.unsplash.com/photo-1551830820-330a71b99659?w=800&q=80&fit=crop'),
    (19, 'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=800&q=80&fit=crop'),
    (20, 'https://images.unsplash.com/photo-1601362840469-51e4d8d58785?w=800&q=80&fit=crop'),
    (21, 'https://images.unsplash.com/photo-1609152712027-76a5a7e8ce27?w=800&q=80&fit=crop&crop=top'),
    (22, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80&fit=crop&crop=top'),
    (23, 'https://images.unsplash.com/photo-1504222490345-c075b7b1abc0?w=800&q=80&fit=crop&crop=top'),
]

for part_id, url in updates:
    c.execute('UPDATE parts SET image_url = ? WHERE id = ?', (url, part_id))
    print(f'Updated part {part_id}')

conn.commit()
conn.close()
print('\nDone! All images updated.')