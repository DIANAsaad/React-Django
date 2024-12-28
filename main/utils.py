from django.apps import apps
from django.http import JsonResponse
import json



def delete_object(request, app_label, model_name, object_id):
    if request.method=="POST":
        data=json.loads(request.body)
        object_id=data.get(object_id)
        model=apps.get_model(app_label,model_name)
        if model:
            model.objects.get(id=object_id).delete()
            return JsonResponse({"message":f"{model_name} successduly deleted"},  status=200)
        return JsonResponse({"message":f"{model_name} not found"},  status=404)
    return JsonResponse({'message':'Invalid request'}, status=400)

          