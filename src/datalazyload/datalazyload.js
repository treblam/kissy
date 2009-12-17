/**
 * ͼƬ�ӳټ������
 * @module      imglazyload
 * @creator     ��<lifesinger@gmail.com>
 * @depends     kissy-core, yahoo-dom-event
 */
KISSY.add("imglazyload", function(S) {

    var Y = YAHOO.util, Dom = Y.Dom, Event = Y.Event, Lang = YAHOO.lang,
        win = window, doc = document,
        DATA_SRC = "data-lazyload-src",
        MOD = { AUTO: "auto", MANUAL: "manual" },
        DEFAULT = "default",

        defaultConfig = {

            /**
             * ������ģʽ
             *  auto   - �Զ�����html ���ʱ������ img.src ���κδ���
             *  manual - ��� html ʱ���Ѿ�����Ҫ�ӳټ��ص�ͼƬ�� src �����滻Ϊ DATA_SRC
             */
            mod: MOD.AUTO,

            /**
             * ��ǰ�Ӵ����£�diff px ���ͼƬ�ӳټ���
             * �ʵ����ô�ֵ���������û����϶�ʱ�о�ͼƬ�Ѿ����غ�
             * Ĭ��Ϊ��ǰ�Ӵ��߶ȣ���������Ĳ��ӳټ��أ�
             */
            diff: DEFAULT,

            /**
             * ռλָʾͼ
             */
            placeholder: "http://a.tbcdn.cn/kissy/1.0.0/build/imglazyload/spaceball.gif"
        };

    /**
     * ͼƬ�ӳټ������
     * @class ImageLazyload
     * @constructor
     */
    function ImageLazyload(containers, config) {
        // factory or constructor
        if (!(this instanceof arguments.callee)) {
            return new arguments.callee(containers, config);
        }

        // ���������� config һ������
        if (typeof config === "undefined") {
            config = containers;
            containers = [doc];
        }

        // containers ��һ�� HTMLElement ʱ
        if (!Lang.isArray(containers)) {
            containers = [Dom.get(containers) || doc];
        }

        /**
         * ͼƬ�������������Զ������Ĭ��Ϊ [doc]
         * @type Array
         */
        this.containers = containers;

        /**
         * ���ò���
         * @type Object
         */
        this.config = S.merge(defaultConfig, config || {});

        /**
         * ��Ҫ�ӳ����ص�ͼƬ
         * @type Array
         */
        //this.images

        /**
         * ��ʼ�ӳٵ� Y ����
         * @type number
         */
        //this.threshold

        this._init();
    }

    S.mix(ImageLazyload.prototype, {

        /**
         * ��ʼ��
         * @protected
         */
        _init: function() {
            this.threshold = this._getThreshold();
            this.images = this._filterImgs();

            if (this.images.length > 0) {
                this._initLoadEvent();
            }
        },

        /**
         * ��ȡ��ֵ
         * @protected
         */
        _getThreshold: function() {
            var diff = this.config.diff,
                ret = Dom.getViewportHeight();

            if (diff === DEFAULT) return 2 * ret; // diff Ĭ��Ϊ��ǰ�Ӵ��߶ȣ���������Ĳ��ӳټ��أ�
            else return ret + diff;
        },

        /**
         * ��ʼ�������¼�
         * @protected
         */
        _initLoadEvent: function() {
            var timer, self = this;

            // scroll �� resize ʱ������ͼƬ
            Event.on(win, "scroll", loader);
            Event.on(win, "resize", function() {
                self.threshold = self._getThreshold();
                loader(true);
            });

            // �ֹ�ģʽʱ����һ��Ҳ�п����� data-src ��
            if (this.config.mod === MOD.MANUAL) {
                // ��Ҫ��������һ�Σ��Ա�֤��һ��ͼƬ�ɼ�
                Event.onDOMReady(function() {
                    self._loadImgs(true);
                });
            }

            // ���غ���
            function loader(force) {
                if (timer) return;
                timer = setTimeout(function() {
                    self._loadImgs(force);
                    if (self.images.length === 0) {
                        Event.removeListener(win, "scroll", loader);
                        Event.removeListener(win, "resize", loader);
                    }
                    timer = null;
                }, 100); // 0.1s �ڣ��û��о�����
            }
        },

        /**
         * ��ȡ����ʼ����Ҫ�ӳ����ص�ͼƬ
         * @protected
         */
        _filterImgs: function() {
            var containers = this.containers,
                threshold = this.threshold,
                placeholder = this.config.placeholder,
                isManualMod = this.config.mod === MOD.MANUAL,
                n, N, imgs, i, len, img, data_src,
                ret = [];

            for (n = 0,N = containers.length; n < N; ++n) {
                imgs = containers[n].getElementsByTagName("img");

                for (i = 0,len = imgs.length; i < len; ++i) {
                    img = imgs[i];
                    data_src = img.getAttribute(DATA_SRC);

                    if (isManualMod) { // �ֹ�ģʽ��ֻ������ data-src ��ͼƬ
                        if (data_src) {
                            img.src = placeholder;
                            ret.push(img);
                        }
                    } else { // �Զ�ģʽ��ֻ���� threshold ���� data-src ��ͼƬ
                        // ע�⣺���� data-src ���������������ʵ�����������ظ�����
                        // �ᵼ�� data-src ��� placeholder
                        if (Dom.getY(img) > threshold && !data_src) {
                            img.setAttribute(DATA_SRC, img.src);
                            img.src = placeholder;
                            ret.push(img);
                        }
                    }
                }
            }

            return ret;
        },

        /**
         * ����ͼƬ
         * @protected
         */
        _loadImgs: function(force) {
            var scrollTop = Dom.getDocumentScrollTop();
            if (!force && scrollTop <= this.config.diff) return;

            var imgs = this.images,
                threshold = this.threshold + scrollTop,
                i, img, data_src, remain = [];

            for (i = 0; img = imgs[i++];) {
                if (Dom.getY(img) <= threshold) {
                    data_src = img.getAttribute(DATA_SRC);

                    if (data_src && img.src != data_src) {
                        img.src = data_src;
                        img.removeAttribute(DATA_SRC);
                    }
                } else {
                    remain.push(img);
                }
            }

            this.images = remain;
        }
    });

    S.ImageLazyload = ImageLazyload;
});

/**
 * NOTES:
 *
 * ģʽΪ auto ʱ��
 *  1. �� Firefox �·ǳ��������ű�����ʱ����û���κ�ͼƬ��ʼ���أ������������ӳټ��ء�
 *  2. �� IE �²����������ű�����ʱ���в���ͼƬ�Ѿ���������������ӣ��ⲿ�� abort ����
 *     ���ڹ���ʱ�ӳټ��أ�������������������
 *  3. �� Safari �� Chrome �£���Ϊ webkit �ں� bug�������޷� abort �����ء���
 *     �ű���ȫ���á�
 *  4. �� Opera �£��� Firefox һ�£�������
 *
 * ģʽΪ manual ʱ����Ҫ�ӳټ��ص�ͼƬ��src �����滻Ϊ data-lazyload-src, ���� src ��ֵ��Ϊ placeholder ��
 *  1. ���κ�������¶���������ʵ�֡�
 *  2. ȱ���ǲ�������ǿ���� JS ʱ��ͼƬ����չʾ��
 *
 * ȱ�㣺
 *  1. ���ڴ󲿷�����£���Ҫ�϶��鿴���ݵ�ҳ�棨�����������ҳ�������ٹ���ʱ����������
 *     �����飨�û��������������ã����ر������ٲ���ʱ��
 *  2. auto ģʽ��֧�� Webkit �ں��������IE �£��п��ܵ��� HTTP �����������ӡ�
 *
 * �ŵ㣺
 *  1. ���Ժܺõ����ҳ���ʼ�����ٶȡ�
 *  2. ��һ������ת���ӳټ���ͼƬ���Լ���������
 *
 * �ο����ϣ�
 *  1. http://davidwalsh.name/lazyload MooTools ��ͼƬ�ӳٲ��
 *  2. http://vip.qq.com/ ģ�����ʱ�����滻��ͼƬ�� src
 *  3. http://www.appelsiini.net/projects/lazyload jQuery Lazyload
 *  4. http://www.dynamixlabs.com/2008/01/17/a-quick-look-add-a-loading-icon-to-your-larger-images/
 *  5. http://www.nczonline.net/blog/2009/11/30/empty-image-src-can-destroy-your-site/
 *
 * �ر�Ҫע��Ĳ�������:
 *  1. ��ʼ���ں�С�����󴰿�ʱ��ͼƬ��������
 *  2. ҳ���й���λ��ʱ��ˢ��ҳ�棬ͼƬ��������
 *  3. �ֶ�ģʽ����һ�����ӳ�ͼƬʱ����������
 */

/**
 * TODOs:
 *   - [ȡ��] ����ͼƬ���ӳټ��أ����� css ��ı���ͼƬ�� sprite ���Ѵ�����
 *   - [ȡ��] ����ʱ�� loading ͼ������δ�趨��С��ͼƬ��������������[�ο����� 4]��
 */