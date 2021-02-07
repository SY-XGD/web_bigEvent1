$(function() {
    // 调用initArtCateList()函数，获取文章分类列表数据
    initArtCateList();
    // 获取文章分类列表
    var layer = layui.layer;
    // 定义layer.open执行返回的一个索引
    var indexAdd = null;
    var form = layui.form;

    function initArtCateList() {
        $.ajax({
            method: 'GET',
            url: '/my/article/cates',
            success: function(res) {
                // console.log(res);

                // 渲染文章分类列表 用模板引擎方法
                var htmlStr = template('tpl-table', res);
                $('tbody').html(htmlStr);
            }
        })
    }

    // 给“添加类别”按钮绑定点击事件
    $('#btnAddCate').on('click', function() {
        indexAdd = layer.open({
            type: 1,
            area: ['500px', '250px'],
            title: '添加文章分类',
            content: $('#dialog-add').html()
        });
    })

    // 通过代理的形式，为 form-add 表单绑定submit事件
    $('body').on('submit', '#form-add', function(e) {
        e.preventDefault();
        $.ajax({
            method: 'POST',
            url: '/my/article/addcates',
            data: $(this).serialize(),
            success: function(res) {
                if (res.status !== 0) {
                    return layer.msg('新增分类失败！');
                }
                layer.msg('新增分类成功！');
                // 根据索引，关闭弹出层
                layer.close(indexAdd);
                initArtCateList();
            }
        })
    })

    // 通过代理的形式，为 btn-edit 按钮绑定click事件
    var indexEdit = null;
    $('tbody').on('click', '#btn-edit', function() {
        // 弹出一个修改文章分类的表单层
        indexEdit = layer.open({
            type: 1,
            area: ['500px', '250px'],
            title: '修改文章分类',
            content: $('#dialog-edit').html()
        });

        //获取对应分类数据
        var id = $(this).attr('data-id');
        // console.log(id);
        $.ajax({
            method: 'GET',
            url: '/my/article/cates/' + id,
            success: function(res) {
                console.log(res);
                form.val('form-edit', res.data);
            }
        })
    })

    // 通过代理的形式，为 form-edit 表单绑定submit事件
    $('body').on('submit', '#form-edit', function(e) {
        e.preventDefault()
        $.ajax({
            method: 'POST',
            url: '/my/article/updatecate',
            data: $(this).serialize(),
            success: function(res) {
                if (res.status !== 0) {
                    return layer.msg('更新分类数据失败！')
                }
                layer.msg('更新分类数据成功！');
                layer.close(indexEdit)
                initArtCateList()
            }
        })
    })

    //删除文章分类 
    // 通过代理的形式，为 btn-delet 按钮绑定click事件
    $('tbody').on('click', '#btn-delet', function() {
        var id = $(this).attr('data-id');
        console.log(id);
        // 弹出一个询问是否删除该文章分类的表单层
        layer.confirm('确定删除?', { icon: 3, title: '提示' }, function(index) {
            //获取对应分类数据
            $.ajax({
                method: 'GET',
                url: '/my/article/deletecate/' + id,
                success: function(res) {
                    if (res.status !== 0) {
                        return layer.msg('删除分类数据失败！')
                    }
                    layer.msg('更新分类数据成功！');
                    initArtCateList()
                }
            })
            layer.close(index);
        });

    })
})