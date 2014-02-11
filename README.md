##hostからbigscreenへのメッセージ

http://[domain]:8082/[eventCode]/hosts に対して

$.postを行えばメッセージを送信出来る。

###例.
>/\* データ作成 \*/

>var o = {};

>o.id	= 	2;

>o.name 	= 	"tera";

>**//eventCode は "e_000"**

>$.post('http://127.0.0.1:8082/e_000/hosts', o);

これでbigscreenにメッセージを送信出来る。

###注意

※bigscreenが接続されていない場合は送信できない
