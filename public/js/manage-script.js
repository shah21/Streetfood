const openEditModel = (itemId)=>{
    
    fetch('/edit-item/'+itemId,{
        method:'GET',
    },).then((response) => {
        response.json().then(data=>{
            document.getElementById('food-edit-name').value = data.item.food_name;
            document.getElementById('food-edit-description').value = data.item.food_description;
            document.getElementById('food-edit-category').value = data.item.food_category;
            document.getElementById('food-edit-price').value = data.item.food_price;
            document.getElementById('foodId').value = data.item._id;
            $('#editFoodModel').modal('show');
        });
        
    }).catch(err=>{
        console.log(err);
    });
}; 