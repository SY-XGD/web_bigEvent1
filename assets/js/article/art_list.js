$(function() {
    var layer = layui.layer;
    var form = layui.form;
    var laypage = layui.laypage;

    // 定义美化时间的过滤器
    template.defaults.imports.dataFormat = function(date) {
        const dt = new Date(date);

        var y = dt.getFullYear();
        var m = padZero(dt.getMonth() + 1);
        var d = padZero(dt.getDate());
        var hh = padZero(dt.getHours());
        var mm = padZero(dt.getMinutes());
        var ss = padZero(dt.getSeconds());

        return y + '-' + m + '-' + d + ' ' + hh + ':' + mm + ':' + ss;
    }

    // 定义补零函数
    function padZero(n) {
        return n > 9 ? n : '0' + n;
    }

    // 定义一个查询的参数对象，将来请求数据时，需要将请求参数对象提交到服务器
    var q = {
        pagenum: 1, //页码值，默认请求第一页的数据
        pagesize: 2, //每页显示几条数据，默认每页显示2条
        cate_id: '', //文章分类的Id 
        state: '' //文章的发布状态
    }

    // 调用函数，获取文章列表
    initTable();
    // 调用函数，获取文章分类
    initCate();

    // 获取文章列表数据的方法
    function initTable() {
        $.ajax({
            method: 'GET',
            url: '/my/article/list',
            data: q,
            success: function(res) {
                // console.log(res);
                if (res.status !== 0) {
                    return layer.msg('获取文章列表失败！');
                }

                // 使用模板引擎渲染页面数据
                var htmlStr = template('tpl-table', res);
                $('tbody').html(htmlStr);

                // 调用渲染分页方法
                renderPage(res.total);
            }
        })
    }

    // 初始化文章分类的方法
    function initCate() {
        $.ajax({
            method: 'GET',
            url: '/my/article/cates',
            success: function(res) {
                if (res.status !== 0) {
                    return layer.msg('获取文章分类失败');
                }
                layer.msg('获取文章分类成功');
                var htmlStr = template('tpl-cate', res);
                $('[name=cate_id]').html(htmlStr);
                // 通知layui重新渲染
                form.render();
            }
        })
    }

    // 为筛选按钮绑定提交事件
    $('#form-search').on('submit', function(e) {
        e.preventDefault();
        //获取表单中选中的值
        var cate_id = $('[name=cate_id]').val();
        var state = $('[name=state]').val();
        // 为查询参数对象 q 中对应的属性赋值
        q.cate_id = cate_id;
        q.state = state;
        // 根据最新的筛选条件，重新渲染表格数据
        initTable();
    })

    // 定义渲染分页方法
    function renderPage(total) {
        // 调用laypage.render()来渲染分页结构
        laypage.render({
            elem: 'pageBox', //分页容器的ID
            count: total, //总数据条数
            limit: q.pagesize, //每页显示的条数
            limits: [2, 3, 5, 10], //自定义每页展示的数据条数
            curr: q.pagenum, //设置默认选中的分页
            layout: ['count', 'limit', 'prev', 'page', 'next', 'skip'],
            jump: function(obj, first) {
                // console.log(obj.curr);
                // 把当前分页赋值给q.pagenum，显示指定分页
                q.pagenum = obj.curr;
                // 把最新的条目数赋值给q.pagesize
                q.pagesize = obj.limit;

                // 解决initTable()死循环的方法
                if (!first) {
                    initTable();
                }

            }
        })
    }

    // 删除功能
    // 通过委托的办法，给删除按钮绑定点击事件
    $('tbody').on('click', '.btn-delete', function() {
        var id = $(this).attr('data-id');
        // 获取删除按钮的个数
        var len = $('.btn-delete').length;
        console.log(len);
        // console.log(id);
        // 弹出一个询问层，询问是否删除
        layer.confirm('确定删除?', { icon: 3, title: '提示' }, function(index) {
            // 向服务器请求删除
            $.ajax({
                method: 'GET',
                url: '/my/article/delete/' + id,
                success: function(res) {
                    if (res.status !== 0) {
                        return layer.msg('删除失败！');
                    }
                    layer.msg('删除成功！');
                    // 当删除成功后，判断当前页中是否有数据
                    //如果没有数据了，就让页码-1
                    if (len === 1) {
                        // 如果length=1，证明删除后页面就没有数据了
                        // 页码值最小必须是1
                        q.pagenum = (q.pagenum === 1 ? 1 : q.pagenum - 1);
                    }
                    initTable();
                }
            })

            layer.close(index);
        });
    })

    // 编辑功能
    $('tbody').on('click', '.btn-edit', function() {
        $('#editBox').show();
        $('#listBox').hide();
        var id = $(this).attr('data-id');
        console.log(id);
        $.ajax({
            method: 'GET',
            url: '/my/article/' + id,
            success: function(res) {
                console.log(res);
                form.val('form-pub', res.data);

            }
        })
    })


})