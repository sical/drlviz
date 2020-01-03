import ujson as ujson


def split_json(file):
    fi = None
    with open(file, "r") as f:
        fi = ujson.load(f)
    with open("data/"+file, "w") as ujson_file:
        ujson.dump(fi["episode0"], ujson_file, indent=4)


if __name__ == '__main__':
    split_json('health_gathering_supreme.json')
