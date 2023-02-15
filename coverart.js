// ==PREPROCESSOR==
// @name "coverart"
// @author "rockyakisoba"
// @import "%fb2k_path%js\Flags.txt"
// @import "%fb2k_path%js\Helpers.txt"
// ==/PREPROCESSOR==


var coverart_id = {
    front: 0,
    back: 1,
    disc: 2,
    icon: 3,
};
var background_color = RGB(46, 48, 63);
var padding_width = 15;
var text_font = gdi.Font("メイリオ", 13, 0);
var text_color = RGB(255, 255, 255);
var no_cover_src = gdi.Image(fb.FoobarPath + "icon/no_cover.png")

var g_img = null;
var ww = 0;
var wh = 0;

function on_paint(gr) {
    gr.FillSolidRect(0, 0, ww, wh, background_color);

    // カバーアートがあれば表示、なければno_cover.pngを表示、読込中またはmetadbが存在しない場合何も表示しない
    if (g_img) {
        var content_w = ww - (padding_width * 2);
        var scale_w = content_w / g_img.Width;
        var scale_h = wh / g_img.Height;
        var scale = Math.min(scale_w, scale_h);
        var pos_x = 0;
        var pos_y = 0;

        var title = {
            value: fb.Titleformat("%title%").eval(),
            size: gr.MeasureString(fb.Titleformat("%title%").eval(), text_font, 0, 0, ww, wh),
        };
        var album = {
            value: fb.Titleformat("%album%").eval(),
            size: gr.MeasureString(fb.Titleformat("%album%").eval(), text_font, 0, 0, ww, wh),
        };
        var artist = {
            value: fb.Titleformat("%artist%").eval(),
            size: gr.MeasureString(fb.Titleformat("%artist%").eval(), text_font, 0, 0, ww, wh),
        };
        var date = {
            value: fb.Titleformat("%date%").eval(),
            size: gr.MeasureString(fb.Titleformat("%date%").eval(), text_font, 0, 0, ww, wh),
        };

        var youtube_url = fb.Titleformat("%fy_url%").eval();
        if (youtube_url != "" && artist.value.search('- Topic$') != -1) {
            g_img = g_img.Clone((g_img.Width - g_img.Height) / 2, 0, g_img.Height, g_img.Height);
            scale_w = content_w / g_img.Width;
            scale_h = wh / g_img.Height;
            scale = Math.min(scale_w, scale_h);
        }

        var content_h = (g_img.height * scale) + title.size.height + album.size.height + artist.size.height;
        if (scale_w <= scale_h) {
            pos_y = wh / 2 - content_h / 2;
        } else {
            pos_x = (content_w - g_img.Width * scale) / 2;
        }

        gr.DrawImage(g_img, pos_x + padding_width, pos_y, g_img.Width * scale, g_img.Height * scale, 0, 0, g_img.Width, g_img.Height);
        current_height = pos_y + g_img.Height * scale;
        gr.DrawString(title.value, text_font, text_color , (ww - title.size.width) / 2, current_height, ww, wh);
        current_height += title.size.height;
        gr.DrawString(album.value, text_font, text_color , (ww - album.size.width) / 2, current_height, ww, wh);
        current_height += album.size.height;
        gr.DrawString(artist.value, text_font, text_color , (ww - artist.size.width) / 2, current_height, ww, wh);
        current_height += artist.size.height;
        gr.DrawString(date.value, text_font, text_color , (ww - date.size.width) / 2, current_height, ww, wh);
    }
}

function on_size() {
    ww = window.Width;
    wh = window.Height;
}

function on_playback_new_track(metadb) {
    if (metadb) {
        utils.GetAlbumArtAsync(window.ID, metadb, coverart_id.front);
        fb.RunMainMenuCommand("View/Playlist view/Activate now playing");
    }
    g_img = null;
}

function on_get_album_art_done(metadb, art_id, image, image_path) {
    g_img = image;
    if (g_img == null) {
        g_img = no_cover_src;
    }
    window.Repaint();
}

on_playback_new_track(fb.GetNowPlaying());